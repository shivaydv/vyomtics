"use server";

import { getSignedViewUrl } from "./cloud-storage";

/**
 * Transform single product with ALL images signed (for product detail page)
 * Valid for 7 days
 */
export async function transformProductWithSignedUrls<T extends { images: string[] }>(
  product: T
): Promise<T> {
  const signedImages = await Promise.all(product.images.map((img) => getSignedViewUrl(img)));
  return {
    ...product,
    images: signedImages,
  };
}

/**
 * Transform multiple products with ONLY FIRST image signed (for listing pages)
 * Optimized for performance - reduces signing requests by 66%
 * Valid for 7 days
 *
 * Use this for: Product listings, Cart, Wishlist
 * Use transformProductWithSignedUrls() for: Product detail page
 */
export async function transformProductsWithSignedUrls<T extends { images: string[] }>(
  products: T[]
): Promise<T[]> {
  return Promise.all(
    products.map(async (product) => {
      if (product.images.length === 0) {
        return product;
      }

      // Only sign the first image for performance
      const firstImageSigned = await getSignedViewUrl(product.images[0]);

      return {
        ...product,
        images: [firstImageSigned],
      };
    })
  );
}
