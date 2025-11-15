"use server";

import { prisma } from "@/prisma/db";
import { transformProductsWithSignedUrls } from "@/lib/image-utils";

// Get dashboard statistics with time filter
export async function getDashboardStats(
  timeFilter: "today" | "30days" | "90days" | "lifetime" = "today"
) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Determine date range based on filter
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    if (timeFilter === "today") {
      startDate = startOfToday;
      // Previous day for comparison
      previousStartDate = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      previousEndDate = startOfToday;
    } else if (timeFilter === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      previousEndDate = startDate;
    } else if (timeFilter === "90days") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      previousEndDate = startDate;
    } else {
      // Lifetime
      startDate = new Date(0); // Beginning of time
      previousStartDate = new Date(0);
      previousEndDate = new Date(0);
    }

    // Get stats for current period and previous period
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      previousRevenue,
      todayRevenue,
      todayOrders,
    ] = await Promise.all([
      // Total revenue - only count successfully paid orders (time-filtered)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: "SUCCESS",
        },
        _sum: { total: true },
      }),
      // Total orders - ALL orders ever (not time-filtered)
      prisma.order.count(),
      // Total customers - ALL customers ever (not time-filtered)
      prisma.user.count({
        where: { role: "USER" },
      }),
      // Total products
      prisma.product.count(),
      // Previous period revenue - only successfully paid (for comparison)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: previousEndDate },
          paymentStatus: "SUCCESS",
        },
        _sum: { total: true },
      }),
      // Today's stats - only successfully paid
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          paymentStatus: "SUCCESS",
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfToday } },
      }),
    ]);

    // Calculate percentage changes
    const revenueChange =
      timeFilter === "lifetime"
        ? 0
        : calculatePercentageChange(previousRevenue._sum.total || 0, totalRevenue._sum.total || 0);
    // Orders and Customers now show totals, so no growth percentage
    const ordersChange = 0;
    const customersChange = 0;

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueChange,
        ordersChange,
        customersChange,
        productsChange: 0,
        // Today's stats
        todayRevenue: todayRevenue._sum.total || 0,
        todayOrders,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

// Get revenue data for charts (last 12 months)
export async function getRevenueData() {
  try {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const [revenue, orders] = await Promise.all([
        prisma.order.aggregate({
          where: {
            createdAt: { gte: date, lt: nextDate },
            status: { notIn: ["CANCELLED"] },
          },
          _sum: { total: true },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: date, lt: nextDate },
          },
        }),
      ]);

      months.push({
        month: date.toLocaleString("default", { month: "short" }),
        revenue: revenue._sum.total || 0,
        orders,
      });
    }

    return { success: true, data: months };
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return { success: false, error: "Failed to fetch revenue data" };
  }
}

// Get category distribution for pie chart
export async function getCategoryDistribution() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const data = categories.map((cat) => ({
      name: cat.name,
      value: cat._count.products,
      color: generateColorForCategory(cat.name),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching category distribution:", error);
    return { success: false, error: "Failed to fetch category distribution" };
  }
}

// Get top selling products
export async function getTopProducts(limit: number = 5) {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        category: true,
      },
    });

    // Transform images to signed URLs
    const productsWithSignedUrls = await transformProductsWithSignedUrls(products);

    const data = topProducts.map((item) => {
      const product = productsWithSignedUrls.find((p) => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || "Unknown",
        sales: item._sum.quantity || 0,
        orders: item._count.productId,
        image: product?.images[0] || "/placeholder.svg",
        category: product?.category.name || "Unknown",
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching top products:", error);
    return { success: false, error: "Failed to fetch top products" };
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
}

// Get order stats by status
export async function getOrdersByStatus(timeFilter: "30days" | "90days" | "lifetime" = "30days") {
  try {
    const now = new Date();
    let startDate: Date;

    if (timeFilter === "30days") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeFilter === "90days") {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0);
    }

    const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED"];

    const statusCounts = await Promise.all(
      statuses.map(async (status) => {
        const count = await prisma.order.count({
          where: {
            createdAt: { gte: startDate },
            status: status as any,
          },
        });
        return { status, count };
      })
    );

    return { success: true, data: statusCounts };
  } catch (error) {
    console.error("Error fetching orders by status:", error);
    return { success: false, error: "Failed to fetch order status data" };
  }
}

// Helper function to generate consistent colors for categories
function generateColorForCategory(name: string): string {
  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}
