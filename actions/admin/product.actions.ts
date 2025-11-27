"use server";

import { ProductFormData, productSchema } from "@/lib/zod-schema";
import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

// Get all products with filtering (including ratings for admin)
export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}) {
  try {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters?.isBestSeller !== undefined) {
      where.isBestSeller = filters.isBestSeller;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Get single product by ID
export async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Get single product by slug (for URLs)
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Create product
export async function createProduct(data: ProductFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    // Check if slug already exists
    const existing = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing) {
      return { success: false, error: "Product with this slug already exists" };
    }

    // Verify category exists if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return { success: false, error: "Category not found" };
      }
    }

    // Use placeholder image if no images provided
    const productImages =
      validatedData.images.length > 0 ? validatedData.images : ["https://placehold.co/600x400"];

    const product = await prisma.product.create({
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        shortDescription: validatedData.shortDescription,
        description: validatedData.description,
        images: productImages,
        video: validatedData.video,
        categoryId: validatedData.categoryId,
        mrp: validatedData.mrp,
        sellingPrice: validatedData.sellingPrice,
        stock: validatedData.stock,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        isBestSeller: validatedData.isBestSeller,
        isOnSale: validatedData.isOnSale,
        isNewArrival: validatedData.isNewArrival,
        sections: validatedData.sections as any,
        faqs: validatedData.faqs as any,
        tags: validatedData.tags,
      },
      include: {
        category: true,
      },
    });

    // ✅ Clear cache when product is created
    revalidatePath("/admin/products");
    revalidatePath("/products"); // Revalidate store products page
    revalidatePath("/", "layout"); // Revalidate home page (featured products)

    return { success: true, data: product };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create product" };
  }
}

// Update product
export async function updateProduct(id: string, data: ProductFormData) {
  await requireAdmin();

  try {
    // Validate data
    const validatedData = productSchema.parse(data);

    // Check if slug is taken by another product
    const existing = await prisma.product.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existing && existing.id !== id) {
      return { success: false, error: "Product with this slug already exists" };
    }

    // Verify category exists if provided
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });

      if (!category) {
        return { success: false, error: "Category not found" };
      }
    }

    // Use placeholder image if no images provided
    const productImages =
      validatedData.images.length > 0 ? validatedData.images : ["https://placehold.co/600x400"];

    const product = await prisma.product.update({
      where: { id },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        shortDescription: validatedData.shortDescription,
        description: validatedData.description,
        images: productImages,
        video: validatedData.video,
        categoryId: validatedData.categoryId,
        mrp: validatedData.mrp,
        sellingPrice: validatedData.sellingPrice,
        stock: validatedData.stock,
        isActive: validatedData.isActive,
        isFeatured: validatedData.isFeatured,
        isBestSeller: validatedData.isBestSeller,
        isOnSale: validatedData.isOnSale,
        isNewArrival: validatedData.isNewArrival,
        sections: validatedData.sections as any,
        faqs: validatedData.faqs as any,
        tags: validatedData.tags,
      },
      include: {
        category: true,
      },
    });

    // ✅ Clear cache when product is updated
    revalidatePath("/admin/products");
    revalidatePath("/products"); // Revalidate store products page
    revalidatePath(`/products/${product.slug}`); // Revalidate product detail page
    revalidatePath("/", "layout"); // Revalidate home page (featured products)

    return { success: true, data: product };
  } catch (error) {
    console.error("Error updating product:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to update product" };
  }
}

// Delete product
export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({
      where: { id },
    });

    // ✅ Clear cache when product is deleted
    revalidatePath("/admin/products");
    revalidatePath("/products"); // Revalidate store products page
    revalidatePath("/", "layout"); // Revalidate home page

    return { success: true, message: "Product deleted successfully" };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Update stock quantity
export async function updateStock(productId: string, stock: number) {
  await requireAdmin();

  try {
    if (stock < 0) {
      return { success: false, error: "Stock quantity cannot be negative" };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

// Alias for updateStock
export const updateProductStock = updateStock;

// Toggle product featured status
export async function toggleProductFeatured(id: string) {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isFeatured: !product.isFeatured },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product featured:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Toggle product best seller status
export async function toggleProductBestSeller(id: string) {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isBestSeller: !product.isBestSeller },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product best seller:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Toggle product sale status
export async function toggleProductSale(id: string) {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isOnSale: !product.isOnSale },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product sale:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Toggle product active status
export async function toggleProductActive(id: string) {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product active:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Toggle product new arrival status
export async function toggleProductNewArrival(id: string) {
  await requireAdmin();

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isNewArrival: !product.isNewArrival },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling product new arrival:", error);
    return { success: false, error: "Failed to update product" };
  }
}
