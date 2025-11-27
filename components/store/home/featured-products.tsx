import { prisma } from "@/prisma/db";
import { ProductCarousel } from "@/components/store/home/product-carousel";

interface FeaturedProductsProps {
  title: string;
  filter: "featured" | "bestseller" | "new" | "sale";
}

export async function FeaturedProducts({ title, filter }: FeaturedProductsProps) {
  const whereClause = {
    isActive: true,
    ...(filter === "featured" && { isFeatured: true }),
    ...(filter === "bestseller" && { isBestSeller: true }),
    ...(filter === "new" && { isNewArrival: true }),
    ...(filter === "sale" && { isOnSale: true }),
  };

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
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

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">Discover our most popular products</p>
        </div>

        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
