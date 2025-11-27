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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">All Categories</h1>
          <p className="text-lg text-gray-600">
            Explore our wide range of electronics, robotics, and DIY components
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const minPrice = category.products[0]?.sellingPrice;
            const productCount = category._count.products;

            return (
              <Link key={category.id} href={`/categories/${category.slug}`} className="group">
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={category.image || "/images/placeholder.png"}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {minPrice && (
                        <p className="text-sm font-semibold text-blue-600">
                          from {formatPrice(minPrice)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {productCount} {productCount === 1 ? "product" : "products"}
                      </p>
                    </div>
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
