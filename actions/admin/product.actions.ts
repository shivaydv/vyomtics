"use server";

import { ProductFormData, productSchema } from "@/lib/zod-schema";
import { prisma } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { transformProductsWithSignedUrls, transformProductWithSignedUrls } from "@/lib/image-utils";
import { requireAdmin } from "@/lib/admin-auth";

// Get all products with filtering (including ratings for admin)
export async function getProducts(filters?: {
  categoryId?: string;
  search?: string;
  inStock?: boolean;
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
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.inStock !== undefined) {
      where.inStock = filters.inStock;
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

    // Transform images to signed URLs
    const productsWithSignedUrls = await transformProductsWithSignedUrls(products);

    return { success: true, data: productsWithSignedUrls };
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

    // Transform images to signed URLs
    const productWithSignedUrls = await transformProductWithSignedUrls(product);

    return { success: true, data: productWithSignedUrls };
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

    // Transform images to signed URLs
    const productWithSignedUrls = await transformProductWithSignedUrls(product);

    return { success: true, data: productWithSignedUrls };
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

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Auto-calculate inStock for each variant based on stockQuantity
    const variantsWithStock = validatedData.variants.map((variant) => ({
      ...variant,
      inStock: variant.stockQuantity > 0,
    }));

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        variants: variantsWithStock,
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

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Auto-calculate inStock for each variant based on stockQuantity
    const variantsWithStock = validatedData.variants.map((variant) => ({
      ...variant,
      inStock: variant.stockQuantity > 0,
    }));

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData,
        variants: variantsWithStock,
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

// Update variant stock quantity
export async function updateVariantStock(
  productId: string,
  variantIndex: number,
  stockQuantity: number
) {
  await requireAdmin();

  try {
    if (stockQuantity < 0) {
      return { success: false, error: "Stock quantity cannot be negative" };
    }

    // Fetch the product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Parse variants from JSON
    const variants: any[] = Array.isArray(product.variants) ? [...product.variants] : [];

    if (variantIndex < 0 || variantIndex >= variants.length) {
      return { success: false, error: "Invalid variant index" };
    }

    // Update the specific variant
    const currentVariant = variants[variantIndex];
    variants[variantIndex] = {
      ...currentVariant,
      stockQuantity,
      inStock: stockQuantity > 0,
    };

    // Update the product with new variants
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        variants: variants as any,
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Error updating variant stock:", error);
    return { success: false, error: "Failed to update stock" };
  }
}

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
