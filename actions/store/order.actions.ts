"use server";

import { prisma } from "@/prisma/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { buildImageKitUrl } from "@/lib/cloud-storage";

// Helper function to transform order items with ImageKit URLs
function transformOrderItemsWithSignedUrls(items: any[]) {
  return items.map((item) => {
    if (item.product?.images && item.product.images.length > 0) {
      const imageUrls = item.product.images.map((img: string) => buildImageKitUrl(img));
      return {
        ...item,
        product: {
          ...item.product,
          images: imageUrls,
        },
      };
    }
    return item;
  });
}

// Get user's orders
export async function getUserOrders() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform all orders with ImageKit URLs
    const ordersWithImageUrls = orders.map((order) => ({
      ...order,
      items: transformOrderItemsWithSignedUrls(order.items),
    }));

    return { success: true, data: ordersWithImageUrls };
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

// Get single order
export async function getUserOrder(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Transform order items with ImageKit URLs
    const orderWithImageUrls = {
      ...order,
      items: transformOrderItemsWithSignedUrls(order.items),
    };

    return { success: true, data: orderWithImageUrls };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// Get user's order statistics
export async function getUserOrderStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const [totalOrders, totalSpent, recentOrders] = await Promise.all([
      prisma.order.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.order.aggregate({
        where: {
          userId: session.user.id,
          paymentStatus: "SUCCESS",
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.findMany({
        where: {
          userId: session.user.id,
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent._sum.total || 0,
        recentOrders,
      },
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return { success: false, error: "Failed to fetch order statistics" };
  }
}
