import { generatePageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/store/home/hero-carousel";
import { ShopCategoryCards } from "@/components/store/home/shop-category-cards";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { Testimonials } from "@/components/store/home/testimonials";
import { CategoryGrid } from "@/components/store/home/category-grid";

export const metadata = generatePageMetadata({
  path: "/",
});

// Home page can be statically generated and revalidated
export const revalidate = 3600; // Revalidate every hour

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <ShopCategoryCards />
      {/* <CategoryGrid /> */}
      <FeaturedProducts title="SHOP OUR BESTSELLERS" filter="bestseller" />
      <Testimonials />
      <FeaturedProducts title="NEW LAUNCH" filter="new" />
      <TrustBadges />
    </>
  );
}
