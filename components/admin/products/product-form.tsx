"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/admin/product.actions";
import { getCategories } from "@/actions/admin/category.actions";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { productSchema, type ProductFormData, ProductSection, ProductFaq } from "@/lib/zod-schema";
import { MediaSection } from "@/components/admin/shared/media-section";
import { SectionEditor } from "./section-editor";
import { FaqEditor } from "./faq-editor";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ProductFormProps {
  product?: any;
  mode: "create" | "edit";
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const getDefaultValues = (): ProductFormData => {
    if (product) {
      return {
        title: product.title || "",
        slug: product.slug || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        images: product.images || [],
        video: product.video || "",
        categoryId: product.categoryId || null,
        mrp: product.mrp || 0,
        sellingPrice: product.sellingPrice || 0,
        stock: product.stock || 0,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isOnSale: product.isOnSale || false,
        isNewArrival: product.isNewArrival || false,
        sections: (product.sections as ProductSection[]) || [],
        faqs: (product.faqs as ProductFaq[]) || [],
        tags: product.tags || [],
      };
    }

    return {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      images: [],
      video: "",
      categoryId: null,
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isOnSale: false,
      isNewArrival: false,
      sections: [],
      faqs: [],
      tags: [],
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data as any);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsInitializing(false);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const title = watch("title");
  useEffect(() => {
    if (title && mode === "create") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [title, setValue, mode]);

  // Build hierarchical category tree
  const buildCategoryTree = (cats: Category[]): any[] => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Flatten tree for display with indentation levels
  const flattenTree = (
    tree: any[],
    level = 0,
    result: Array<any & { level: number }> = []
  ): Array<any & { level: number }> => {
    tree.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenTree(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const hierarchicalCategories = flattenTree(buildCategoryTree(categories));

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const result =
        mode === "create" ? await createProduct(data) : await updateProduct(product.id, data);

      if (result.success) {
        toast.success(`Product ${mode === "create" ? "created" : "updated"} successfully`);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} product`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing product:`, error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "Add Product" : "Edit Product"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create" ? "Create a new product" : "Update product information"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{mode === "create" ? "Create Product" : "Update Product"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" {...register("title")} placeholder="Enter product title" />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input id="slug" {...register("slug")} placeholder="product-slug" />
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      {...register("shortDescription")}
                      placeholder="Brief description for product cards"
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Enter detailed product description"
                      rows={8}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Inventory</CardTitle>
                  <CardDescription>Set product pricing and stock levels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mrp">MRP *</Label>
                      <Input
                        id="mrp"
                        type="number"
                        step="0.01"
                        {...register("mrp", { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {errors.mrp && (
                        <p className="text-sm text-destructive">{errors.mrp.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price *</Label>
                      <Input
                        id="sellingPrice"
                        type="number"
                        step="0.01"
                        {...register("sellingPrice", { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {errors.sellingPrice && (
                        <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      {...register("stock", { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="text-sm text-destructive">{errors.stock.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images (Optional)</CardTitle>
                  <CardDescription>
                    Upload multiple product images. A placeholder will be used if no images are
                    provided.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="images"
                    render={({ field }) => (
                      <MediaSection
                        media={field.value || []}
                        onChange={(newMedia) => field.onChange(newMedia)}
                        maxFiles={10}
                        maxSizeMB={5}
                      />
                    )}
                  />
                  {errors.images && (
                    <p className="text-sm text-destructive mt-2">{errors.images.message}</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Video (Optional)</CardTitle>
                  <CardDescription>Add a product video URL</CardDescription>
                </CardHeader>
                <CardContent>
                  <Input {...register("video")} placeholder="https://youtube.com/watch?v=..." />
                  {errors.video && (
                    <p className="text-sm text-destructive mt-2">{errors.video.message}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Content Sections</CardTitle>
                  <CardDescription>
                    Add custom sections like text blocks, bullet lists, or specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="sections"
                    render={({ field }) => (
                      <SectionEditor sections={field.value} onChange={field.onChange} />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product FAQs</CardTitle>
                  <CardDescription>
                    Add frequently asked questions about this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="faqs"
                    render={({ field }) => (
                      <FaqEditor faqs={field.value} onChange={field.onChange} />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
              <CardDescription>Control product visibility and flags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="isActive" />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured Product</Label>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isFeatured"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isBestSeller">Best Seller</Label>
                <Controller
                  name="isBestSeller"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isBestSeller"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isOnSale">On Sale</Label>
                <Controller
                  name="isOnSale"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="isOnSale" />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isNewArrival">New Arrival</Label>
                <Controller
                  name="isNewArrival"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isNewArrival"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>Select product category (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      if (value === "__uncategorized__") {
                        field.onChange(null);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value || "__uncategorized__"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Uncategorized" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__uncategorized__">🗂️ Uncategorized</SelectItem>
                      {hierarchicalCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span style={{ paddingLeft: `${category.level * 16}px` }}>
                            {category.level > 0 ? "└─ " : "📁 "}
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-2">{errors.categoryId.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
