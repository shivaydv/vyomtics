import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { ModernProductCard } from "@/components/store/products/modern-product-card";
import { ProductFilters } from "@/components/store/products/product-filters";
import { ProductSort } from "@/components/store/products/product-sort";
import { MobileFilters } from "@/components/store/products/mobile-filters";
import { ProductPagination } from "@/components/store/products/product-pagination";

export const metadata = generatePageMetadata({
  path: "/products",
  title: "All Products",
  description: "Browse our complete collection of electronics, robotics, and DIY components",
});

export const revalidate = 3600;

interface SearchParams {
  category?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, search, sort = "newest", minPrice, maxPrice, inStock, page = "1" } = params;

  // Build where clause
  const whereClause: any = {
    isActive: true,
  };

  // Handle category filter - include nested categories
  if (category) {
    const categoryData = await prisma.category.findUnique({
      where: { slug: category },
      select: {
        id: true,
        children: {
          where: { isActive: true },
          select: { id: true }
        }
      },
    });

    if (categoryData) {
      // Include products from this category AND all its children
      const categoryIds = [
        categoryData.id,
        ...categoryData.children.map(child => child.id)
      ];

      whereClause.categoryId = {
        in: categoryIds
      };
    }
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  if (minPrice || maxPrice) {
    whereClause.sellingPrice = {};
    if (minPrice) whereClause.sellingPrice.gte = parseFloat(minPrice);
    if (maxPrice) whereClause.sellingPrice.lte = parseFloat(maxPrice);
  }

  if (inStock === "true") {
    whereClause.stock = { gt: 0 };
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: "desc" };

  if (sort === "price-asc") orderBy = { sellingPrice: "asc" };
  if (sort === "price-desc") orderBy = { sellingPrice: "desc" };
  if (sort === "name") orderBy = { title: "asc" };
  if (sort === "popular") orderBy = { isBestSeller: "desc" };

  // Pagination
  const currentPage = parseInt(page);
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        images: true,
        mrp: true,
        sellingPrice: true,
        stock: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        isOnSale: true,
      },
    }),
    prisma.product.count({ where: whereClause }),
    // Fetch all categories with their children for nested display
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="container mx-auto px-4 py-6 border-b border-gray-100">
        <nav className="text-sm text-gray-500 font-medium mb-3">
          <a href="/" className="hover:text-gray-900 transition-colors">
            Home
          </a>
          <span className="mx-2 text-gray-300">/</span>
          <span className="text-gray-900">Products</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            <p className="text-sm text-gray-600 mt-1">
              Browse our complete collection of electronics, robotics, and DIY components
            </p>
          </div>
          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <MobileFilters categories={categories} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <ProductFilters categories={categories} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {totalCount} {totalCount === 1 ? "Product" : "Products"}
              </h2>
              <ProductSort />
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ModernProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <ProductPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  We couldn't find any products matching your filters. Try adjusting your search or filter criteria.
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center justify-center px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Clear All Filters
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
