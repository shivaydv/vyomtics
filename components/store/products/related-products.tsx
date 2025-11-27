import { prisma } from "@/prisma/db";
import { ProductCard } from "@/components/store/products/product-card";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      isActive: true,
      id: { not: currentProductId },
    },
    take: 4,
    orderBy: {
      isBestSeller: "desc",
    },
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
    <section className="mt-16 pt-12 border-t border-gray-200">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Related Products</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
