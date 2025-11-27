import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";

export const metadata = generatePageMetadata({
  path: "/categories",
  title: "All Categories",
  description: "Browse products by category",
});

export const revalidate = 3600;

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
        orderBy: {
          sellingPrice: "asc",
        },
        take: 1,
        select: {
          sellingPrice: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="container mx-auto px-4 py-8 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">All Categories</h1>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categories.map((category) => {
            const minPrice = category.products[0]?.sellingPrice;
            const productCount = category._count.products;

            return (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={category.image || "/images/placeholder.png"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-gray-700 transition-colors">
                      {category.name}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {productCount} {productCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
