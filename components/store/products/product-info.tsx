"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/utils/format";
import { Heart, Minus, Plus, Share2, ShoppingCart, Star, Copy, Check, Loader2 } from "lucide-react";
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addItem, isProductLoading: isCartLoading } = useCart();
  const { isInWishlist, toggleItem, isProductLoading: isWishlistLoading } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const isAddingToCart = isCartLoading(product.id);
  const isTogglingWishlist = isWishlistLoading(product.id);

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
    } catch (error) {
      // Error toast is handled in the hook
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleItem(product.id);
    } catch (error) {
      // Error is already handled in the hook with optimistic revert
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Could not copy text', err);
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {product.isNewArrival && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">New Arrival</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Bestseller</Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Featured</Badge>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">{product.title}</h1>
        {/* Description */}
        {product.shortDescription && (
          <p className="text-base text-gray-600 leading-relaxed ">
            {product.shortDescription}
          </p>
        )}
        <div className="flex items-center gap-4">
          {product.avgRating !== undefined && product.reviewCount !== undefined && (
            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              <div className="flex items-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm text-gray-900">{product.avgRating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300 text-xs">|</span>
              <span className="text-xs text-gray-600 underline decoration-gray-300 underline-offset-4">
                {product.reviewCount} reviews
              </span>
            </div>
          )}

          {product.stock > 0 && product.stock <= 10 && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              Only {product.stock} left!
            </span>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900 tracking-tight">
            {formatPrice(product.sellingPrice)}
          </span>
          {discount > 0 && (
            <div className="flex flex-col items-start">
              <span className="text-lg text-gray-400 line-through font-medium">
                {formatPrice(product.mrp)}
              </span>
              <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-0.5 rounded-md">
                Save {discount}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-green-500" />
          Inclusive of all taxes
        </p>
      </div>



      {/* Actions */}
      <div className="space-y-4 pt-2">
        {!isOutOfStock ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg bg-white w-full sm:w-auto h-12">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="h-full w-10 rounded-l-lg hover:bg-gray-50"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-10 text-center font-bold text-base">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stock}
                className="h-full w-10 rounded-r-lg hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1 bg-gray-900 hover:bg-black text-white h-12 rounded-lg text-base font-semibold shadow-lg shadow-gray-200 hover:shadow-xl hover:shadow-gray-300 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
            <p className="text-red-600 font-bold text-base">Currently Out of Stock</p>
            <p className="text-red-500 text-xs mt-0.5">We'll notify you when it's back!</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 text-sm disabled:opacity-50"
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 mr-2 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
            )}
            {inWishlist ? "Saved" : "Wishlist"}
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-10 rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-gray-700 text-sm"
            onClick={() => setShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>
              Copy the link below to share this product
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="bg-gray-50 cursor-pointer h-10"
                onClick={(e) => {
                  e.currentTarget.select();
                }}
                onFocus={(e) => {
                  e.currentTarget.blur();
                }}
              />
            </div>
            <Button type="button" size="lg" className="px-4 bg-gray-900 hover:bg-black h-10" onClick={handleCopyLink}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
