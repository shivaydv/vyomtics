"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { USER_ROLE } from "@/prisma/generated/prisma";
import { requireAdmin } from "@/lib/admin-auth";

// Get all users with filtering
export async function getUsers(filters?: { role?: USER_ROLE; search?: string }) {
  await requireAdmin();
  try {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            total: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total spent for each user
    const usersWithStats = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      totalOrders: user._count.orders,
      totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
    }));

    return { success: true, data: usersWithStats };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Get single user with detailed stats
export async function getUser(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Calculate total spent
    const allOrders = await prisma.order.findMany({
      where: { userId: id },
      select: { total: true },
    });

    const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      success: true,
      data: {
        ...user,
        totalSpent,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Get user statistics
export async function getUserStats() {
  await requireAdmin();

  try {
    const [totalUsers, adminCount, userCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: USER_ROLE.ADMIN } }),
      prisma.user.count({ where: { role: USER_ROLE.USER } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        adminCount,
        userCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { success: false, error: "Failed to fetch user statistics" };
  }
}

// Update user role (ADMIN only)
export async function updateUserRole(userId: string, newRole: USER_ROLE) {
  await requireAdmin();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      data: user,
      message: `User role updated to ${newRole} successfully`,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}
