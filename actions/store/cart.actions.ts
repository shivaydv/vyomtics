"use server";

import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Get or create cart ID for logged-in user only
async function getCartId() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return null; // No cart for guests
  }

  // Logged-in user
  let cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  }

  return cart.id;
}

// Get cart with full product details and signed URLs
export async function getCart() {
  try {
    const cartId = await getCartId();

    // No cart for guests
    if (!cartId) {
      return { success: true, data: { items: [] }, requiresLogin: true };
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            cart: false,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: true, data: { items: [] } };
    }

    // Fetch product details for all cart items (optimized - only select needed fields)
    const productIds = cart.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        variants: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Map cart items with full product details
    const enrichedItems = cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;

        // Find the specific variant
        const variant = (product.variants as any[]).find((v) => v.weight === item.weight);
        if (!variant) return null;

        return {
          id: item.id,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] || "/placeholder.svg",
          price: variant.price,
          weight: item.weight,
          quantity: item.quantity,
          inStock: variant.inStock,
          stockQuantity: variant.stockQuantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { success: true, data: { items: enrichedItems } };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, error: "Failed to fetch cart" };
  }
}

// Add item to cart
export async function addToCart(productId: string, weight: string, quantity: number = 1) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to add items to cart", requiresLogin: true };
    }

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_weight: {
          cartId,
          productId,
          weight,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      // Create new item
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          weight,
          quantity,
        },
      });
    }

    revalidatePath("/");
    return { success: true, message: "Item added to cart" };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(itemId: string, quantity: number) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to update cart", requiresLogin: true };
    }

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    revalidatePath("/");
    return { success: true, message: "Cart updated" };
  } catch (error) {
    console.error("Error updating cart:", error);
    return { success: false, error: "Failed to update cart" };
  }
}

// Remove item from cart
export async function removeFromCart(itemId: string) {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to remove items", requiresLogin: true };
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/");
    return { success: true, message: "Item removed from cart" };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

// Clear entire cart
export async function clearCart() {
  try {
    const cartId = await getCartId();

    // Require login
    if (!cartId) {
      return { success: false, error: "Please login to clear cart", requiresLogin: true };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId },
    });

    revalidatePath("/");
    return { success: true, message: "Cart cleared" };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
