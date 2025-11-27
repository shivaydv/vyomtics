"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart-db";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface ModernProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    images: string[];
    mrp: number;
    sellingPrice: number;
    stock: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
  };
}

export function ModernProductCard({ product }: ModernProductCardProps) {
  const { addItem, isLoading } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const [isHovered, setIsHovered] = useState(false);

  const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  const isOutOfStock = product.stock === 0;
  const hasSecondImage = product.images.length > 1;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      await addItem(product.id, product.title, 1);
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleItem(product.id);
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full flex flex-col border border-gray-100">
        {/* Image Container */}
        <div className="relative aspect-square bg-white">
          {/* Badges - Top Left */}
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
            {discount > 0 && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 text-xs px-2 py-0.5 rounded-sm shadow-sm">
                Sale {discount}%
              </Badge>
            )}
          </div>

          {/* Product Image - Show 2nd image on hover if available */}
          <Image
            src={
              isHovered && hasSecondImage
                ? product.images[1]
                : product.images[0] || "/images/placeholder.png"
            }
            alt={product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 50vw, 25vw"
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="bg-gray-900 text-white px-4 py-2 rounded-md font-medium text-sm shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 border-t border-gray-100">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 leading-snug">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.sellingPrice)}
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            {/* Savings Badge */}
            {discount > 0 && (
              <div className="mb-3">
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  Save Rs. {product.mrp - product.sellingPrice}
                </span>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="w-full h-10 text-sm font-medium rounded-md border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
              size="sm"
              variant="outline"
            >
              {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
