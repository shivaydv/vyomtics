import { siteConfig } from "@/site.config";
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || siteConfig.domain;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/account/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
