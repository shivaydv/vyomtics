import type React from "react";
import { Poppins } from "next/font/google";
import { ReactLenis } from "@/components/shared/lenis";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { siteConfig } from "@/site.config";
import "lenis/dist/lenis.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: `${siteConfig.title}`,
  description: siteConfig.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={` ${poppins.className} antialiased`} suppressHydrationWarning>
      <ReactLenis root>
        <body className="min-h-screen bg-background text-foreground" suppressHydrationWarning>
          <ScrollToTop />
          {children}
          <Toaster />
        </body>
      </ReactLenis>
    </html>
  );
}
