import { generatePageMetadata } from "@/lib/metadata";
import { prisma } from "@/prisma/db";
import { notFound } from "next/navigation";
import { ProductImageGallery } from "@/components/store/products/product-image-gallery";
import { ProductInfo } from "@/components/store/products/product-info";
import { ProductTabs } from "@/components/store/products/product-tabs";
import { RelatedProducts } from "@/components/store/products/related-products";
import { ProductReviews } from "@/components/store/products/product-reviews";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true, images: true },
  });

  if (!product) return {};

  return generatePageMetadata({
    path: `/products/${slug}`,
    title: product.title,
    description: product.shortDescription || product.title,
  });
}

export const revalidate = 3600;

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Parse JSON fields
  const sections =
    typeof product.sections === "string" ? JSON.parse(product.sections) : product.sections;
  const faqs = typeof product.faqs === "string" ? JSON.parse(product.faqs) : product.faqs;

  // Calculate average rating
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-blue-600">
            Home
          </a>
          <span className="mx-2">/</span>
          {product.category && (
            <>
              <a href={`/categories/${product.category.slug}`} className="hover:text-blue-600">
                {product.category.name}
              </a>
              <span className="mx-2">/</span>
            </>
          )}
          <span className="text-gray-900">{product.title}</span>
        </nav>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <ProductImageGallery images={product.images} title={product.title} />
          <ProductInfo
            product={{
              ...product,
              avgRating,
              reviewCount: product.reviews.length,
            }}
          />
        </div>

        {/* Product Tabs */}
        <ProductTabs description={product.description} sections={sections} faqs={faqs} />

        {/* Reviews Section */}
        <ProductReviews productId={product.id} reviews={product.reviews} avgRating={avgRating} />

        {/* Related Products */}
        {product.categoryId && (
          <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
        )}
      </div>
    </div>
  );
}
