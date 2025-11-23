import { getProducts } from "@/actions/admin/product.actions";
import { getCategories } from "@/actions/admin/category.actions";
import { ProductsTableClient } from "./products-table-client";
import { ProductsTableFilters } from "./products-table-filters";

interface ProductsTableWrapperProps {
  filters: {
    search?: string;
    category?: string;
    status?: string;
    featured?: string;
    page?: string;
  };
}

export async function ProductsTableWrapper({ filters }: ProductsTableWrapperProps) {
  const [productsResult, categoriesResult] = await Promise.all([getProducts(), getCategories()]);

  const allProducts = productsResult.success ? productsResult.data : [];
  const categories = categoriesResult.success ? categoriesResult.data : [];

  console.log("[ProductsTableWrapper] Total products fetched:", allProducts?.length);
  console.log("[ProductsTableWrapper] First product sample:", allProducts?.[0]);

  // Apply filters
  let filteredProducts = allProducts || [];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.title?.toLowerCase().includes(searchLower) ||
        product.category?.name?.toLowerCase().includes(searchLower)
    );
  }

  // Category filter
  if (filters.category && filters.category !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category?.id === filters.category
    );
  }

  // Status filter (in stock based on stock quantity)
  if (filters.status) {
    if (filters.status === "in-stock") {
      filteredProducts = filteredProducts.filter((product) => product.stock > 0);
    } else if (filters.status === "out-of-stock") {
      filteredProducts = filteredProducts.filter((product) => product.stock === 0);
    }
  }

  // Featured filter
  if (filters.featured === "featured") {
    filteredProducts = filteredProducts.filter((product) => product.isFeatured);
  } else if (filters.featured === "bestseller") {
    filteredProducts = filteredProducts.filter((product) => product.isBestSeller);
  } else if (filters.featured === "sale") {
    filteredProducts = filteredProducts.filter((product) => product.isOnSale);
  }

  // Pagination
  const page = parseInt(filters.page || "1");
  const pageSize = 10;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <ProductsTableFilters totalProducts={filteredProducts.length} categories={categories || []} />
      <ProductsTableClient
        products={paginatedProducts}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}
