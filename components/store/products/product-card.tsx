"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart-db";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface ProductCardProps {
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

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  const isOutOfStock = product.stock === 0;

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
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50">
          {/* Sale Badge */}
          {discount > 0 && (
            <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 text-xs font-bold z-10">
              Sale {discount}%
            </div>
          )}

          <Image
            src={product.images[0] || "/images/placeholder.png"}
            alt={product.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 16vw"
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg font-semibold text-gray-900">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          <h3 className="font-normal text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-1">
            {discount > 0 && (
              <div className="text-xs text-gray-500 line-through">
                Rs. {product.mrp.toLocaleString()}
              </div>
            )}
            <div className="text-lg font-bold text-blue-600">
              Rs. {product.sellingPrice.toLocaleString()}
            </div>
            {discount > 0 && (
              <div className="text-xs text-green-600 font-medium">
                Save Rs. {(product.mrp - product.sellingPrice).toLocaleString()}
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isLoading}
            variant="outline"
            className="w-full text-xs py-2 h-auto hover:bg-blue-600 hover:text-white transition-colors"
            size="sm"
          >
            {isOutOfStock ? "OUT OF STOCK" : "ADD TO CART"}
          </Button>
        </div>
      </div>
    </Link>
  );
}
