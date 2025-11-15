"use server";

import { prisma } from "@/prisma/db";
import { requireAdmin } from "@/lib/admin-auth";
import { revalidatePath, revalidateTag } from "next/cache";

// Get site configuration (or create default if doesn't exist)
export async function getSiteConfig() {
  try {
    let config = await prisma.siteConfig.findFirst();

    // Create default config if none exists
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          shippingCharge: 50,
          freeShippingMinOrder: 500,
          showAnnouncementBar: true,
          announcementText: "Free shipping on orders above ₹500!",
        },
      });
    }

    return { success: true, data: config };
  } catch (error) {
    console.error("Error fetching site config:", error);
    return { success: false, error: "Failed to fetch site configuration" };
  }
}

// Update site configuration (admin only)
export async function updateSiteConfig(data: {
  shippingCharge?: number | null;
  freeShippingMinOrder?: number | null;
  showAnnouncementBar?: boolean;
  announcementText?: string;
}) {
  await requireAdmin();

  try {
    // Get or create config
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          shippingCharge: data.shippingCharge ?? 50,
          freeShippingMinOrder: data.freeShippingMinOrder ?? 500,
          showAnnouncementBar: data.showAnnouncementBar ?? true,
          announcementText: data.announcementText ?? "Free shipping on orders above ₹500!",
        },
      });
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          ...(data.shippingCharge !== undefined && { shippingCharge: data.shippingCharge }),
          ...(data.freeShippingMinOrder !== undefined && {
            freeShippingMinOrder: data.freeShippingMinOrder,
          }),
          ...(data.showAnnouncementBar !== undefined && {
            showAnnouncementBar: data.showAnnouncementBar,
          }),
          ...(data.announcementText !== undefined && { announcementText: data.announcementText }),
        },
      });
    }

    // ✅ Clear cache when site config is updated
    revalidatePath("/", "layout"); // Revalidate all pages
    revalidatePath("/checkout"); // Revalidate checkout (shipping)

    return { success: true, data: config };
  } catch (error) {
    console.error("Error updating site config:", error);
    return { success: false, error: "Failed to update site configuration" };
  }
}

// Calculate shipping charge based on order total
export async function calculateShippingCharge(orderTotal: number) {
  try {
    const configResult = await getSiteConfig();

    if (!configResult.success || !configResult.data) {
      // Return default if config fetch fails
      return {
        success: true,
        data: {
          shippingCharge: orderTotal >= 500 ? 0 : 50,
          isFreeShipping: orderTotal >= 500,
        },
      };
    }

    const config = configResult.data;

    // If shipping charge is not configured, no shipping
    if (config.shippingCharge === null) {
      return {
        success: true,
        data: {
          shippingCharge: 0,
          isFreeShipping: true,
          freeShippingMinOrder: null,
        },
      };
    }

    // Check if free shipping threshold is met
    const isFreeShipping =
      config.freeShippingMinOrder !== null && orderTotal >= config.freeShippingMinOrder;
    const shippingCharge = isFreeShipping ? 0 : config.shippingCharge;

    return {
      success: true,
      data: {
        shippingCharge,
        isFreeShipping,
        freeShippingMinOrder: config.freeShippingMinOrder,
      },
    };
  } catch (error) {
    console.error("Error calculating shipping charge:", error);
    return { success: false, error: "Failed to calculate shipping charge" };
  }
}
