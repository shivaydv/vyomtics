"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { updateVariantStock } from "@/actions/admin/product.actions";
import { Package, Loader2 } from "lucide-react";

interface ProductVariant {
  weight: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  inStock: boolean;
}

interface StockDialogProps {
  product: {
    id: string;
    name: string;
    variants: ProductVariant[];
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StockDialog({ product, open, onOpenChange, onSuccess }: StockDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariantIndex(0);
      setStockQuantity(product.variants[0].stockQuantity);
    }
  }, [product, open]);

  const handleVariantChange = (value: string) => {
    const index = parseInt(value);
    setSelectedVariantIndex(index);
    if (product?.variants?.[index]) {
      setStockQuantity(product.variants[index].stockQuantity);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (stockQuantity < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateVariantStock(product.id, selectedVariantIndex, stockQuantity);

      if (result.success) {
        toast.success("Stock updated successfully");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update stock");
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVariant = product?.variants?.[selectedVariantIndex];
  const totalStock = product?.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Update Stock</DialogTitle>
              <DialogDescription className="text-sm mt-1">{product?.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {product && product.variants && product.variants.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Total Stock Display */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Stock</span>
                  <Badge variant="outline" className="text-base">
                    {totalStock} units
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Variant Selection */}
            <div className="space-y-2">
              <Label htmlFor="variant">Select Variant *</Label>
              <Select value={selectedVariantIndex.toString()} onValueChange={handleVariantChange}>
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Select a variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{variant.weight}</span>
                        <span className="text-muted-foreground">• ${variant.price.toFixed(2)}</span>
                        <Badge
                          variant={
                            variant.inStock && variant.stockQuantity > 0 ? "outline" : "secondary"
                          }
                          className="ml-2"
                        >
                          {variant.stockQuantity} in stock
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Variant Info */}
            {selectedVariant && (
              <Card className="border-2">
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium">{selectedVariant.weight}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">${selectedVariant.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Stock</span>
                    <Badge variant="outline">{selectedVariant.stockQuantity} units</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">New Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                placeholder="Enter stock quantity"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Change from {selectedVariant?.stockQuantity || 0} to {stockQuantity} units
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Stock"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No variants available for this product
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
