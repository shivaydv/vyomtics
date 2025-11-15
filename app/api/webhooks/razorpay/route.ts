import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import {
  verifyWebhookSignature,
  deductStockForOrder,
  updateCouponUsage,
} from "@/utils/order-helpers";

/**
 * Razorpay Webhook Handler
 * Listens to payment events from Razorpay as a backup mechanism
 * Events handled:
 * - payment.captured: Payment successful
 * - payment.failed: Payment failed
 * - order.paid: Order paid (alternative success event)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    // Parse the payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`Received webhook event: ${event}`);

    // Handle different events
    switch (event) {
      case "payment.captured":
      case "order.paid":
        await handlePaymentSuccess(paymentEntity, orderEntity);
        break;

      case "payment.failed":
        await handlePaymentFailure(paymentEntity, orderEntity);
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  const razorpayPaymentId = paymentEntity?.id;

  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment success for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
    include: { items: true },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already processed
  if (order.paymentStatus === "SUCCESS") {
    console.log(`Order ${order.orderNumber} already marked as successful`);
    return;
  }

  try {
    // Update order in transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "SUCCESS",
          razorpayPaymentId: razorpayPaymentId || order.razorpayPaymentId,
          paymentCapturedAt: new Date(),
          paymentMethod: paymentEntity?.method || "RAZORPAY",
          paymentMeta: paymentEntity || {},
          
        },
      });

      // Deduct stock for all items (only if not already deducted)
      if (order.status === "PENDING") {
        await deductStockForOrder(
          order.items.map((item) => ({
            productId: item.productId,
            variantDetails: item.variantDetails as { weight: string; price: number },
            quantity: item.quantity,
          })),
          tx
        );
      }

      // Update coupon usage if applied
      if (order.couponCode) {
        await updateCouponUsage(order.couponCode, order.userId, tx);
      }
    });

    console.log(`Successfully processed payment for order: ${order.orderNumber}`);
  } catch (error: any) {
    console.error(`Error processing payment success webhook:`, error);
    throw error;
  }
}

async function handlePaymentFailure(paymentEntity: any, orderEntity: any) {
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
  if (!razorpayOrderId) {
    console.error("Missing order ID in webhook payload");
    return;
  }

  console.log(`Processing payment failure for order: ${razorpayOrderId}`);

  // Find order by razorpayOrderId
  const order = await prisma.order.findFirst({
    where: { razorpayOrderId },
  });

  if (!order) {
    console.error(`Order not found for Razorpay Order ID: ${razorpayOrderId}`);
    return;
  }

  // Check if already marked as failed
  if (order.paymentStatus === "FAILED") {
    console.log(`Order ${order.orderNumber} already marked as failed`);
    return;
  }

  try {
    // Update order status to failed
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "FAILED",
        paymentStatus: "FAILED",
        paymentMeta: paymentEntity || {}
      },
    });

    console.log(`Successfully marked order as failed: ${order.orderNumber}`);
  } catch (error: any) {
    console.error(`Error processing payment failure webhook:`, error);
    throw error;
  }
}
