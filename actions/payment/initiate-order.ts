// actions/payment/initiate-order.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/prisma/db";
import Razorpay from "razorpay";
import { OrderDetails, orderDetailsSchema } from "@/lib/zod-schema";
import { calculateShippingCharge } from "@/actions/admin/site-config.actions";
import { generateOrderNumber } from "@/utils/order-helpers";

export async function initiateOrder(orderDetails: OrderDetails) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const validated = orderDetailsSchema.parse(orderDetails);
  const userId = session.user.id;

  // Fetch products and validate stock
  const productIds = [...new Set(validated.items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  // Validate stock and calculate subtotal
  let subtotal = 0;
  for (const item of validated.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variant = (product.variants as any[]).find(
      (v: any) => v.weight === item.variantDetails.weight
    );

    if (!variant) {
      throw new Error(`Variant not found for ${product.name}`);
    }

    if (variant.stockQuantity < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name} (${item.variantDetails.weight}). Available: ${variant.stockQuantity}`
      );
    }

    // Verify price matches
    if (variant.price !== item.variantDetails.price) {
      throw new Error(`Price mismatch for ${product.name}`);
    }

    subtotal += variant.price * item.quantity;
  }

  // Apply coupon discount
  let discount = 0;
  if (validated.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: validated.couponCode, isActive: true },
    });

    if (coupon) {
      // Check if coupon is expired
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new Error("Coupon has expired");
      }

      // Check minimum order value
      if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required for this coupon`);
      }

      // Calculate discount
      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * coupon.value) / 100;
        // Apply max discount cap if exists
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.value;
      }

      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, subtotal);
    }
  }

  const discountedSubtotal = subtotal - discount;

  // Calculate shipping based on site config
  const shippingResult = await calculateShippingCharge(discountedSubtotal);
  const shippingFee = shippingResult.success ? shippingResult.data!.shippingCharge : 50;

  const total = discountedSubtotal + shippingFee;

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create Razorpay Order
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // Amount in paise
    currency: "INR",
    receipt: orderNumber,
    notes: {
      userId,
      orderNumber,
    },
  });

  // Create order in database with PENDING status
  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId,
      status: "PENDING",
      paymentStatus: "PENDING",
      couponCode: validated.couponCode || null,
      subtotal,
      discount,
      shippingFee,
      total,
      shippingAddress: validated.shippingAddress as any,
      billingAddress: (validated.billingAddress || validated.shippingAddress) as any,
      razorpayOrderId: razorpayOrder.id,
      items: {
        create: validated.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          variantDetails: item.variantDetails as any,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return {
    success: true,
    data: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      key: process.env.RAZORPAY_KEY_ID,
      amount: total,
      currency: "INR",
    },
  };
}
