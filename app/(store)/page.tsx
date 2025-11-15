import { generatePageMetadata } from "@/lib/metadata";

export const metadata = generatePageMetadata({
  path: "/",
});

// Home page can be statically generated and revalidated
export const revalidate = 3600; // Revalidate every hour

export default function HomePage() {
  return <>{/* add sections here - like hero, categories, testimonial etc */}</>;
}
