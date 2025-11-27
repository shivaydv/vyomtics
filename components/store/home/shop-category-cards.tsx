import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/prisma/db";
import { formatPrice } from "@/utils/format";

// Vibrant gradient backgrounds for categories without images
const gradients = [
  "from-purple-500 via-pink-500 to-red-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-fuchsia-500 via-purple-500 to-indigo-500",
];

export async function ShopCategoryCards() {
  // Try to get featured categories first
  let categories = await prisma.category.findMany({
    where: {
      isActive: true,
      isFeatured: true,
      parentId: null,
    },
    orderBy: {
      order: "asc",
    },
    take: 5,
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
    },
  });

  // Fallback: If no featured categories or less than 5, get regular active categories
  if (categories.length < 5) {
    const additionalNeeded = 5 - categories.length;
    const existingIds = categories.map((c) => c.id);

    const additionalCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        parentId: null,
        id: {
          notIn: existingIds,
        },
      },
      orderBy: {
        order: "asc",
      },
      take: additionalNeeded,
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
      },
    });

    categories = [...categories, ...additionalCategories];
  }

  // If still no categories, don't render the section
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Categories
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-base md:text-lg text-gray-600">Explore our wide range of categories</p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 md:auto-rows-[220px]">
          {categories.slice(0, 5).map((category, index) => {
            const minPrice = category.products[0]?.sellingPrice;
            const hasImage = category.image && category.image.trim() !== "";
            const gradient = gradients[index % gradients.length];

            // Layout logic for Desktop (lg)
            const isLargeSquare = index === 0;
            const isRightStack = index === 1 || index === 2;
            const isBottomRow = index === 3 || index === 4;

            let gridClasses = "col-span-1 row-span-1"; // Default for mobile/tablet

            // Desktop Layout:
            // Item 0: Big Square (Left) -> 2x2
            // Item 1 & 2: Wide Rectangles (Right) -> 2x1 each, stacked
            // Item 3 & 4: Wide Rectangles (Bottom) -> 2x1 each, side by side

            if (isLargeSquare) {
              gridClasses = "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2";
            } else if (isRightStack) {
              gridClasses = "col-span-2 row-span-1 lg:col-span-2 lg:row-span-1";
            } else if (isBottomRow) {
              gridClasses = "col-span-2 row-span-1 lg:col-span-2 lg:row-span-1";
            }

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] ${gridClasses}`}
              >
                <div className={`relative w-full h-full ${
                  // Aspect ratios - Mobile only
                  isLargeSquare ? "aspect-square lg:aspect-auto" :
                    "aspect-[2/1] lg:aspect-auto"
                  }`}>
                  {hasImage ? (
                    <>
                      <Image
                        src={category.image!}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes={
                          isLargeSquare ? "(max-width: 768px) 100vw, 50vw" :
                            "(max-width: 768px) 100vw, 50vw"
                        }
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <>
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-110`}
                      />
                      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.8)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.6)_0%,transparent_50%)]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className={`font-bold text-white mb-1 drop-shadow-lg ${isLargeSquare ? "text-xl md:text-3xl" : "text-base md:text-xl"
                      }`}>
                      {category.name}
                    </h3>
                    {minPrice && (
                      <p className={`text-white/90 font-medium drop-shadow ${isLargeSquare ? "text-sm md:text-lg" : "text-xs md:text-sm"
                        }`}>
                        Starting from {formatPrice(minPrice)}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-lg">
                    <svg
                      className="w-4 h-4 text-gray-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
