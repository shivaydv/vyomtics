"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/format";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart-db";
import { useWishlist } from "@/hooks/use-wishlist";
import { toast } from "sonner";

interface ProductInfoProps {
  product: {
    id: string;
    title: string;
    shortDescription: string | null;
    mrp: number;
    sellingPrice: number;
    stock: number;
    tags: string[];
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
    avgRating?: number;
    reviewCount?: number;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isLoading } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  const isOutOfStock = product.stock === 0;

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      await addItem(product.id, product.title, quantity);
      toast.success(`Added ${quantity} item(s) to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleItem(product.id);
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.shortDescription || "",
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isNewArrival && (
          <Badge className="bg-green-500 text-white hover:bg-green-600">New Arrival</Badge>
        )}
        {product.isBestSeller && (
          <Badge className="bg-orange-500 text-white hover:bg-orange-600">Bestseller</Badge>
        )}
        {product.isFeatured && (
          <Badge className="bg-purple-500 text-white hover:bg-purple-600">Featured</Badge>
        )}
        {discount > 0 && (
          <Badge className="bg-red-500 text-white hover:bg-red-600">{discount}% OFF</Badge>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{product.title}</h1>

        {/* Rating */}
        {product.avgRating !== undefined && product.reviewCount !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(product.avgRating!)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.avgRating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>
        )}

        {product.shortDescription && (
          <p className="text-lg text-gray-600">{product.shortDescription}</p>
        )}
      </div>

      {/* Price */}
      <div className="border-y border-gray-200 py-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.sellingPrice)}
          </span>
          {discount > 0 && (
            <>
              <span className="text-2xl text-gray-500 line-through">
                {formatPrice(product.mrp)}
              </span>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                Save {formatPrice(product.mrp - product.sellingPrice)}
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">Inclusive of all taxes</p>
      </div>

      {/* Stock Status */}
      <div>
        {isOutOfStock ? (
          <p className="text-red-600 font-semibold text-lg">Out of Stock</p>
        ) : product.stock <= 10 ? (
          <p className="text-orange-600 font-semibold">
            Only {product.stock} left in stock - Order soon!
          </p>
        ) : (
          <p className="text-green-600 font-semibold">In Stock</p>
        )}
      </div>

      {/* Quantity Selector */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-semibold">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= product.stock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          onClick={handleAddToCart}
          disabled={isOutOfStock || isLoading}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>

        <Button size="lg" variant="outline" onClick={handleWishlistToggle}>
          <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
        </Button>

        <Button size="lg" variant="outline" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
