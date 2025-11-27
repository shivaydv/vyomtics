import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/products/product-card";
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
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <nav className="text-sm text-gray-600 mb-4">
                <a href="/" className="hover:text-blue-600">
                  Home
                </a>
                <span className="mx-2">/</span>
                <a href="/categories" className="hover:text-blue-600">
                  Categories
                </a>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{category.name}</span>
              </nav>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{category.name}</h1>

              {category.description && (
                <p className="text-lg text-gray-600">{category.description}</p>
              )}

              <p className="text-gray-600 mt-4">
                {products.length} {products.length === 1 ? "product" : "products"} available
              </p>
            </div>

            {category.image && (
              <div className="relative h-64 lg:h-80 rounded-2xl overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Subcategories:
              </span>
              {category.children.map((child) => (
                <a
                  key={child.id}
                  href={`/categories/${child.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                >
                  {child.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        {/* Sort */}
        <div className="mb-6">
          <ProductSort />
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No products found in this category</p>
            <a href="/products" className="text-blue-600 hover:underline mt-2 inline-block">
              Browse all products
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
