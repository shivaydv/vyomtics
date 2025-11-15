import { prisma } from "@/prisma/db";
import crypto from "crypto";

/**
 * Generates a unique order number in format: ORD-YYYYMMDD-XXX
 * where XXX is a 3-digit sequence number for the day
 */
export async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD

  // Get today's order count
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const todayOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const orderSequence = (todayOrderCount + 1).toString().padStart(3, "0");
  return `ORD-${dateStr}-${orderSequence}`;
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Verifies Razorpay webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return expectedSignature === signature;
}

/**
 * Deducts stock for order items in a transaction
 */
export async function deductStockForOrder(
  orderItems: Array<{
    productId: string;
    variantDetails: { weight: string; price: number };
    quantity: number;
  }>,
  tx: any // Prisma transaction client
) {
  for (const item of orderItems) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variants = product.variants as any[];
    const itemWeight = item.variantDetails.weight;
    const variantIndex = variants.findIndex((v: any) => v.weight === itemWeight);

    if (variantIndex === -1) {
      throw new Error(`Variant not found for product ${product.name} with weight ${itemWeight}`);
    }

    const currentStock = variants[variantIndex].stockQuantity;
    if (currentStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name} (${itemWeight})`);
    }

    const updatedVariants = [...variants];
    const newStockQuantity = currentStock - item.quantity;

    updatedVariants[variantIndex] = {
      ...updatedVariants[variantIndex],
      stockQuantity: newStockQuantity,
      inStock: newStockQuantity > 0,
    };

    await tx.product.update({
      where: { id: item.productId },
      data: { variants: updatedVariants as any },
    });
  }
}

/**
 * Updates coupon usage for an order
 */
export async function updateCouponUsage(
  couponCode: string,
  userId: string,
  tx: any // Prisma transaction client
) {
  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode },
  });

  if (!coupon) {
    return; // Coupon doesn't exist, skip
  }

  // Update global usage count
  await tx.coupon.update({
    where: { id: coupon.id },
    data: {
      totalUsed: {
        increment: 1,
      },
    },
  });

  // Track per-user usage
  const existingUsage = await tx.couponUsage.findUnique({
    where: {
      couponId_userId: {
        couponId: coupon.id,
        userId: userId,
      },
    },
  });

  if (existingUsage) {
    await tx.couponUsage.update({
      where: { id: existingUsage.id },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  } else {
    await tx.couponUsage.create({
      data: {
        couponId: coupon.id,
        userId: userId,
        usedCount: 1,
      },
    });
  }
}
