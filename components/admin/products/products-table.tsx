"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Package, Star, TrendingUp, Tag } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DeleteConfirmDialog } from "@/components/admin/shared/delete-confirm-dialog";
import { StockDialog } from "@/components/admin/products/stock-dialog";
import {
  getProducts,
  deleteProduct,
  toggleProductFeatured,
  toggleProductBestSeller,
  toggleProductSale,
} from "@/actions/admin/product.actions";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/format";

interface ProductVariant {
  weight: string;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  inStock: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  images: string[];
  variants: ProductVariant[];
  isFeatured: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  category: {
    id: string;
    name: string;
  };
}

export function ProductsTable() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productForStock, setProductForStock] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProducts();

    console.log("Fetched products:", result);
    if (result.success && result.data) {
      // Products already have signed URLs from the server action
      setProducts(result.data as any);
    } else {
      toast.error(result.error || "Failed to fetch products");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    router.push(`/admin/products/edit/${product.slug}`);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    const result = await deleteProduct(productToDelete.id);
    if (result.success) {
      toast.success("Product deleted successfully");
      fetchProducts();
    } else {
      toast.error(result.error || "Failed to delete product");
    }
    setIsDeleteOpen(false);
    setProductToDelete(null);
  };

  const handleStockUpdate = (product: Product) => {
    setProductForStock(product);
    setIsStockOpen(true);
  };

  const handleToggleFeatured = async (product: Product) => {
    const result = await toggleProductFeatured(product.id);
    if (result.success) {
      toast.success(`Product ${product.isFeatured ? "removed from" : "marked as"} featured`);
      fetchProducts();
    } else {
      toast.error(result.error || "Failed to update product");
    }
  };

  const handleToggleBestSeller = async (product: Product) => {
    const result = await toggleProductBestSeller(product.id);
    if (result.success) {
      toast.success(`Product ${product.isBestSeller ? "removed from" : "marked as"} best seller`);
      fetchProducts();
    } else {
      toast.error(result.error || "Failed to update product");
    }
  };

  const handleToggleSale = async (product: Product) => {
    const result = await toggleProductSale(product.id);
    if (result.success) {
      toast.success(`Product ${product.isOnSale ? "removed from" : "marked on"} sale`);
      fetchProducts();
    } else {
      toast.error(result.error || "Failed to update product");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No products found. Create your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <div className="flex gap-1 mt-1">
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {product.isBestSeller && (
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Best Seller
                        </Badge>
                      )}
                      {product.isOnSale && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Sale
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.category.name}</TableCell>
                <TableCell>
                  <div>
                    {product.variants && product.variants.length > 0 ? (
                      <>
                        <p className="font-medium">
                          {formatCurrency(Math.min(...product.variants.map((v) => v.price)))}
                          {product.variants.length > 1 && (
                            <span className="text-muted-foreground">
                              {" "}
                              - {formatCurrency(Math.max(...product.variants.map((v) => v.price)))}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">No variants</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStockUpdate(product)}
                    className="gap-1"
                  >
                    <Package className="h-3 w-3" />
                    {product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0}
                  </Button>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.variants?.some((v) => v.inStock && v.stockQuantity > 0)
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {product.variants?.some((v) => v.inStock && v.stockQuantity > 0)
                      ? "In Stock"
                      : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(product)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStockUpdate(product)}>
                        <Package className="h-4 w-4 mr-2" />
                        Update Stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                        <Star className="h-4 w-4 mr-2" />
                        {product.isFeatured ? "Remove from" : "Mark as"} Featured
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleBestSeller(product)}>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {product.isBestSeller ? "Remove from" : "Mark as"} Best Seller
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleSale(product)}>
                        <Tag className="h-4 w-4 mr-2" />
                        {product.isOnSale ? "Remove from" : "Mark on"} Sale
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(product)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />

      <StockDialog
        product={productForStock}
        open={isStockOpen}
        onOpenChange={setIsStockOpen}
        onSuccess={fetchProducts}
      />
    </>
  );
}
