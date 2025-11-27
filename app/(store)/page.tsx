import { generatePageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/store/home/hero-carousel";
import { ShopCategoryCards } from "@/components/store/home/shop-category-cards";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { Testimonials } from "@/components/store/home/testimonials";
import { FAQSection } from "@/components/store/home/faq-section";
import { prisma } from "@/prisma/db";

export const metadata = generatePageMetadata({
  path: "/",
});

// Home page can be statically generated and revalidated
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch published FAQs
  const faqs = await prisma.fAQ.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      order: "asc",
    },
    select: {
      id: true,
      question: true,
      answer: true,
    },
  });

  return (
    <>
      <HeroCarousel />
      <ShopCategoryCards />
      <FeaturedProducts title="SHOP OUR BESTSELLERS" filter="bestseller" />
      <Testimonials />
      <FeaturedProducts title="NEW LAUNCH" filter="new" />
      <TrustBadges />
      <FAQSection faqs={faqs} />
    </>
  );
}
