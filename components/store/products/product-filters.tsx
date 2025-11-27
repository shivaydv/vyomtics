"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { X } from "lucide-react";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentInStock = searchParams.get("inStock") === "true";

  const [priceRange, setPriceRange] = useState([0, 50000]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters =
    currentCategory ||
    currentInStock ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!currentCategory}
              onCheckedChange={() => updateFilters("category", null)}
            />
            <Label htmlFor="all-categories" className="text-sm font-normal cursor-pointer">
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.slug}
                checked={currentCategory === category.slug}
                onCheckedChange={(checked) => {
                  updateFilters("category", checked ? category.slug : null);
                }}
              />
              <Label htmlFor={category.slug} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-4">
          <Slider min={0} max={50000} step={500} value={priceRange} onValueChange={setPriceRange} />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.set("minPrice", priceRange[0].toString());
              params.set("maxPrice", priceRange[1].toString());
              router.push(`/products?${params.toString()}`);
            }}
          >
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="font-medium mb-3">Availability</h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={currentInStock}
            onCheckedChange={(checked) => {
              updateFilters("inStock", checked ? "true" : null);
            }}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>
    </div>
  );
}
