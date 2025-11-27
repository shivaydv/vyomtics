// actions/payment/confirm-order.ts
"use server";

import { prisma } from "@/prisma/db";
import {
  verifyRazorpaySignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";

export async function confirmOrder({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    // Step 1: Verify signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      // Mark order as failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: "Invalid payment signature" },
        },
      });
      throw new Error("Payment verification failed");
    }

    // Step 2: Find the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Step 3: Check if order is already processed
    if (order.paymentStatus === "SUCCESS") {
      return {
        success: true,
        data: order,
        message: "Order already processed",
      };
    }

    // Step 4: Update order in transaction - SUCCESS flow
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpay_payment_id,
          paymentCapturedAt: new Date(),

          paymentMethod: "RAZORPAY",
        },
        include: {
          items: true,
        },
      });

      // Deduct stock for all items
      await deductStockForOrder(
        order.items.map((item) => ({
          productId: item.productId,
          variantDetails: item.variantDetails as { price: number },
          quantity: item.quantity,
        })),
        tx
      );

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }

      return updated;
    });

    return {
      success: true,
      data: updatedOrder,
      message: "Payment confirmed successfully",
    };
  } catch (error: any) {
    console.error("Error confirming order:", error);

    // Try to mark order as failed
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "FAILED",
          paymentStatus: "FAILED",
          paymentMeta: { error: error.message || "Unknown error" },
        },
      });
    } catch (updateError) {
      console.error("Failed to update order status to failed:", updateError);
    }

    throw error;
  }
}
