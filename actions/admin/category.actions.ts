"use server";

import { CategoryFormData, categorySchema } from "@/lib/zod-schema";
import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSignedViewUrl } from "@/lib/cloud-storage";
import { requireAdmin } from "@/lib/admin-auth";

// Validation Schema

// Get all categories
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { order: "asc" },
    });

    // Transform category images to signed URLs
    const categoriesWithSignedUrls = await Promise.all(
      categories.map(async (cat) => {
        const signedImage = cat.image ? await getSignedViewUrl(cat.image) : cat.image;
        return {
          ...cat,
          image: signedImage,
          productCount: cat._count.products,
        };
      })
    );

    return {
      success: true,
      data: categoriesWithSignedUrls,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get single category by ID
export async function getCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Transform category image to signed URL
    const signedImage = category.image ? await getSignedViewUrl(category.image) : category.image;

    return {
      success: true,
      data: {
        ...category,
        image: signedImage,
        productCount: category._count.products,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Get single category by slug (for URLs)
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Transform category image to signed URL
    const signedImage = category.image ? await getSignedViewUrl(category.image) : category.image;

    return {
      success: true,
      data: {
        ...category,
        image: signedImage,
        productCount: category._count.products,
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

// Create category
export async function createCategory(data: CategoryFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.create({
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating category:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create category" };
  }
}

// Update category
export async function updateCategory(id: string, data: CategoryFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = categorySchema.parse(data);

    // Check if slug is taken by another category
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "Category with this slug already exists" };
    }

    const category = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/categories");
    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating category:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update category" };
  }
}

// Delete category
export async function deleteCategory(id: string) {
  await requireAdmin();

  try {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `Cannot delete category with ${category._count.products} products. Please reassign or delete the products first.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// Toggle category active status
export async function toggleCategoryStatus(id: string) {
  await requireAdmin();

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling category status:", error);
    return { success: false, error: "Failed to update category status" };
  }
}
