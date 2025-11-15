import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  title: "Products",
  description: "Browse our collection of premium organic products",
  path: "/products",
  keywords: ["organic products", "natural products", "healthy living"],
});

// Revalidate products page every 30 minutes
export const revalidate = 1800;

export default function ProductsPage() {
  return (
    // add all products along with filter
    <div>page</div>
  );
}
