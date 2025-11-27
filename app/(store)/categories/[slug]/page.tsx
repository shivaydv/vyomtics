import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { notFound } from "next/navigation";
import { ModernProductCard } from "@/components/store/products/modern-product-card";
import { ProductSort } from "@/components/store/products/product-sort";
import Image from "next/image";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!category) return {};

  return generatePageMetadata({
    path: `/categories/${slug}`,
    title: category.name,
    description: category.description || `Browse ${category.name}`,
  });
}

export const revalidate = 3600;

interface SearchParams {
  sort?: string;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { sort = "newest" } = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: "desc" };

  if (sort === "price-asc") orderBy = { sellingPrice: "asc" };
  if (sort === "price-desc") orderBy = { sellingPrice: "desc" };
  if (sort === "name") orderBy = { title: "asc" };
  if (sort === "popular") orderBy = { isBestSeller: "desc" };

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    orderBy,
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
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Category Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <nav className="text-sm text-gray-500 font-medium">
                <a href="/" className="hover:text-gray-900 transition-colors">
                  Home
                </a>
                <span className="mx-3 text-gray-300">/</span>
                <a href="/categories" className="hover:text-gray-900 transition-colors">
                  Categories
                </a>
                <span className="mx-3 text-gray-300">/</span>
                <span className="text-gray-900">{category.name}</span>
              </nav>

              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-4">{category.name}</h1>
                {category.description && (
                  <p className="text-xl text-gray-600 leading-relaxed max-w-xl">{category.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {products.length} {products.length === 1 ? "product" : "products"} available
              </div>
            </div>

            {category.image && (
              <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Subcategories Grid - Primary View if available */}
        {category.children.length > 0 ? (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {category.children.map((child) => (
                <a
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 block"
                >
                  {child.image ? (
                    <Image
                      src={child.image}
                      alt={child.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-bold text-xl mb-1">{child.name}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <span>View Products</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Show products below if any exist directly in this parent category */}
            {products.length > 0 && (
              <div className="pt-16 border-t border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">All Products in {category.name}</h2>
                  <ProductSort />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {products.map((product) => (
                    <ModernProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Products Grid - Only View if no subcategories */
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-0 z-10 py-4 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <ProductSort />
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                <p className="text-gray-500 max-w-md mx-auto">
                  We couldn't find any products in this category at the moment. Please check back later.
                </p>
                <a href="/products" className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors mt-8">
                  Browse All Products
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
