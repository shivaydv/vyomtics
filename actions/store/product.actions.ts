"use server";

import { prisma } from "@/prisma/db";

export interface ProductFilters {
  categorySlug?: string;
  categorySlugs?: string[];
  search?: string;
  minRating?: number;
  availability?: "all" | "in-stock" | "out-of-stock";
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOnSale?: boolean;
  sortBy?: "featured" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating" | "newest";
  page?: number;
  limit?: number;
}

// Get products with advanced filtering and sorting
export async function getFilteredProducts(filters: ProductFilters = {}) {
  try {
    const {
      categorySlug,
      categorySlugs,
      search,
      minRating,
      availability = "all",
      isFeatured,
      isBestSeller,
      isOnSale,
      sortBy = "featured",
      page = 1,
      limit = 12,
    } = filters;

    const where: any = {};

    // Single category filter (for category pages)
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        return { success: false, error: "Category not found" };
      }

      where.categoryId = category.id;
    }

    // Multiple categories filter (for products page)
    if (categorySlugs && categorySlugs.length > 0) {
      const categories = await prisma.category.findMany({
        where: {
          slug: { in: categorySlugs },
          isActive: true,
        },
      });

      if (categories.length > 0) {
        where.categoryId = { in: categories.map((c) => c.id) };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Availability filter will be applied after fetching due to JSON field

    // Feature filters
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isBestSeller !== undefined) {
      where.isBestSeller = isBestSeller;
    }

    if (isOnSale !== undefined) {
      where.isOnSale = isOnSale;
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "featured":
        orderBy = { isFeatured: "desc" };
        break;
      // Price and rating sorting will be done in memory due to JSON/aggregate fields
    }

    // Fetch products with category and reviews
    let products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      orderBy,
    });

    // Filter by availability (variants are in JSON)
    if (availability && availability !== "all") {
      products = products.filter((product) => {
        const variants = Array.isArray(product.variants) ? product.variants : [];
        const hasStock = variants.some((v: any) => v.inStock && v.stockQuantity > 0);

        if (availability === "in-stock") {
          return hasStock;
        } else if (availability === "out-of-stock") {
          return !hasStock;
        }
        return true;
      });
    }

    // Calculate average ratings and filter
    const productsWithRatings = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    // Filter by minimum rating
    let filteredProducts = productsWithRatings;
    if (minRating !== undefined) {
      filteredProducts = productsWithRatings.filter((p) => p.averageRating >= minRating);
    }

    // Sort by price or rating (in memory)
    if (sortBy === "price-asc") {
      filteredProducts.sort((a, b) => {
        const aMinPrice = Math.min(...(a.variants as any[]).map((v: any) => v.price));
        const bMinPrice = Math.min(...(b.variants as any[]).map((v: any) => v.price));
        return aMinPrice - bMinPrice;
      });
    } else if (sortBy === "price-desc") {
      filteredProducts.sort((a, b) => {
        const aMaxPrice = Math.max(...(a.variants as any[]).map((v: any) => v.price));
        const bMaxPrice = Math.max(...(b.variants as any[]).map((v: any) => v.price));
        return bMaxPrice - aMaxPrice;
      });
    } else if (sortBy === "rating") {
      filteredProducts.sort((a, b) => b.averageRating - a.averageRating);
    }

    // Pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(skip, skip + limit);

    return {
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        totalProducts,
        totalPages,
      },
    };
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

// Get product by slug with reviews
export async function getProductWithReviews(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Calculate rating stats
    const ratings = product.reviews.map((r) => r.rating);
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const ratingDistribution = ratings.reduce(
      (acc, rating) => {
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>
    );

    return {
      success: true,
      data: {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: ratings.length,
        ratingDistribution,
      },
    };
  } catch (error) {
    console.error("Error fetching product with reviews:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Get related products
export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId },
      },
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Add average ratings
    const productsWithRatings = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    return { success: true, data: productsWithRatings };
  } catch (error) {
    console.error("Error fetching related products:", error);
    return { success: false, error: "Failed to fetch related products" };
  }
}
