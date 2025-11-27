import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { ModernProductCard } from "@/components/store/products/modern-product-card";
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
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="max-w-3xl">
            <nav className="text-sm text-gray-500 font-medium mb-6">
              <a href="/" className="hover:text-gray-900 transition-colors">
                Home
              </a>
              <span className="mx-3 text-gray-300">/</span>
              <span className="text-gray-900">Products</span>
            </nav>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">All Products</h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Browse our complete collection of electronics, robotics, and DIY components.
              Find everything you need for your next project.
            </p>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-6">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {totalCount} products available
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <ProductFilters categories={categories} />
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Options */}
            <div className="bg-white border-b border-gray-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
              <ProductSort />
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ModernProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  We couldn't find any products matching your filters. Try adjusting your search or filter criteria.
                </p>
                <a
                  href="/products"
                  className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
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
