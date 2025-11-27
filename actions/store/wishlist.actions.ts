"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Get user's wishlist
export async function getWishlist() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: true, data: { items: [] } };
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        productId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            title: true,
            slug: true,
            images: true,
            sellingPrice: true,
            mrp: true,
            stock: true,
            shortDescription: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedItems = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: item.product,
      createdAt: item.createdAt,
    }));

    return { success: true, data: { items: enrichedItems } };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return { success: false, error: "Failed to fetch wishlist" };
  }
}

// Toggle wishlist item (add if not exists, remove if exists)
export async function toggleWishlist(productId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      revalidatePath("/");
      return { success: true, message: "Removed from wishlist", isInWishlist: false };
    } else {
      await prisma.wishlistItem.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      revalidatePath("/");
      return { success: true, message: "Added to wishlist", isInWishlist: true };
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: "Failed to update wishlist" };
  }
}

// Clear entire wishlist
export async function clearWishlist() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return { success: false, error: "Please login to manage wishlist" };
    }

    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/");
    return { success: true, message: "Wishlist cleared" };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, error: "Failed to clear wishlist" };
  }
}
