"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart-db";
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

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-white overflow-hidden">
          {/* Sale Badge - Top Right Corner */}
          {discount > 0 && (
            <div className="absolute top-0 right-0 z-10">
              <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-bl-lg">
                {discount}% OFF
              </div>
            </div>
          )}

          {/* Product Image */}
          <div className="relative w-full h-full p-6">
            <Image
              src={
                isHovered && hasSecondImage
                  ? product.images[1]
                  : product.images[0] || "/images/placeholder.png"
              }
              alt={product.title}
              fill
              className="object-contain transition-all duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-gray-900 text-white px-4 py-2 rounded font-medium text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 border-t">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-4 leading-relaxed min-h-[40px]">
            {product.title}
          </h3>

          {/* Pricing & Button */}
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.sellingPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-xs text-gray-400 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="text-right">
                  <span className="text-xs text-gray-500">Save</span>
                  <p className="text-sm font-semibold text-green-600">
                    ₹{product.mrp - product.sellingPrice}
                  </p>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className="w-full h-10 text-sm font-medium bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300"
              size="sm"
            >
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
