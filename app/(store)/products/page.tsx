import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { ProductCard } from "@/components/store/products/product-card";
import { ProductFilters } from "@/components/store/products/product-filters";
import { ProductSort } from "@/components/store/products/product-sort";

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
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { category, search, sort = "newest", minPrice, maxPrice, inStock } = params;

  // Build where clause
  const whereClause: any = {
    isActive: true,
  };

  if (category) {
    const categoryData = await prisma.category.findUnique({
      where: { slug: category },
      select: { id: true },
    });
    if (categoryData) {
      whereClause.categoryId = categoryData.id;
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

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy,
      take: 24,
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
    prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <nav className="text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Products</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">All Products</h1>
          <p className="text-lg text-gray-600">
            Showing {products.length} of {totalCount} products
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters categories={categories} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center justify-between">
              <ProductSort />
              <div className="text-sm text-gray-600 font-medium">{totalCount} Products</div>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-24 h-24 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 text-xl font-semibold mb-2">No products found</p>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                <a
                  href="/products"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
