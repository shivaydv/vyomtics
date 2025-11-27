"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";

import {
  getCart,
  addToCart as addToCartAction,
  updateCartItemQuantity as updateCartItemQuantityAction,
  removeFromCart as removeFromCartAction,
  clearCart as clearCartAction,
} from "@/actions/store/cart.actions";
import { getShippingConfig } from "@/actions/store/shipping-config.actions";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  inStock: boolean;
  stockQuantity: number;
}

interface ShippingConfig {
  shippingCharge: number | null;
  freeShippingMinOrder: number | null;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  isInitialized: boolean;
  shippingConfig: ShippingConfig | null;
  fetchCart: () => Promise<void>;
  fetchShippingConfig: () => Promise<void>;
  addItem: (productId: string, name: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearState: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getTotalItems: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  isInitialized: false,
  shippingConfig: null,

  fetchShippingConfig: async () => {
    try {
      const config = await getShippingConfig();
      set({ shippingConfig: config });
    } catch (error) {
      console.error("Error fetching shipping config:", error);
      // Set null values if fetch fails - no defaults
      set({
        shippingConfig: {
          shippingCharge: null,
          freeShippingMinOrder: null,
        },
      });
    }
  },

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const result = await getCart();
      if (result.success && result.data) {
        set({ items: result.data.items, isInitialized: true });
      }
      // Fetch shipping config if not already loaded
      if (!get().shippingConfig) {
        await get().fetchShippingConfig();
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId: string, name: string, quantity: number = 1) => {
    const optimisticItem = get().items.find((item) => item.productId === productId);

    if (optimisticItem) {
      // Optimistic update
      set({
        items: get().items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        ),
      });
    }

    try {
      const result = await addToCartAction(productId, quantity);
      if (result.success) {
        // Refresh cart to get actual data
        await get().fetchCart();
        toast.success(`${name} added to cart`, { duration: 1000 });
      } else {
        // Revert optimistic update
        if (optimisticItem) {
          set({
            items: get().items.map((item) =>
              item.productId === productId ? optimisticItem : item
            ),
          });
        }

        // Check if login is required
        if ((result as any).requiresLogin) {
          toast.error("Please login to add items to cart");
        } else {
          toast.error(result.error || "Failed to add item to cart");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
      // Refresh to sync
      await get().fetchCart();
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    const previousItems = get().items;

    // Optimistic update
    set({
      items: get()
        .items.map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    });

    try {
      const result = await updateCartItemQuantityAction(itemId, quantity);
      if (!result.success) {
        // Revert on failure
        set({ items: previousItems });
        toast.error(result.error || "Failed to update cart");
      }
      // Refresh to sync
      await get().fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      set({ items: previousItems });
      toast.error("Failed to update cart");
    }
  },

  removeItem: async (itemId: string) => {
    const previousItems = get().items;

    // Optimistic update
    set({
      items: get().items.filter((item) => item.id !== itemId),
    });

    try {
      const result = await removeFromCartAction(itemId);
      if (!result.success) {
        // Revert on failure
        set({ items: previousItems });
        toast.error(result.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      set({ items: previousItems });
      toast.error("Failed to remove item");
    }
  },

  clearCart: async () => {
    const previousItems = get().items;

    // Optimistic update
    set({ items: [] });

    try {
      const result = await clearCartAction();
      if (!result.success) {
        // Revert on failure
        set({ items: previousItems });
        toast.error(result.error || "Failed to clear cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      set({ items: previousItems });
      toast.error("Failed to clear cart");
    }
  },

  getSubtotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getShipping: () => {
    const subtotal = get().getSubtotal();
    const config = get().shippingConfig;

    // If shipping charge is not configured (null), no shipping charge
    if (!config || config.shippingCharge === null) {
      return 0;
    }

    // If free shipping threshold is configured and met, no shipping charge
    if (config.freeShippingMinOrder !== null && subtotal >= config.freeShippingMinOrder) {
      return 0;
    }

    // Otherwise, apply the shipping charge
    return config.shippingCharge;
  },

  getTotal: () => {
    return get().getSubtotal() + get().getShipping();
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  isInCart: (productId: string) => {
    return get().items.some((item) => item.productId === productId);
  },

  clearState: () => {
    set({ items: [], isInitialized: false, isLoading: false });
  },
}));

// Hook to auto-sync cart with authentication state
export function useCartSync() {
  const { data: session } = useSession();
  const { fetchCart, clearState, isInitialized } = useCart();

  useEffect(() => {
    if (session?.user?.id && !isInitialized) {
      // User is logged in, fetch cart
      fetchCart();
    } else if (!session?.user?.id && isInitialized) {
      // User logged out, clear cart
      clearState();
    }
  }, [session?.user?.id, isInitialized, fetchCart, clearState]);
}
