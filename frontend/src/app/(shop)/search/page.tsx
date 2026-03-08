"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/queries/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ProductFilters } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const isNew = searchParams.get("isNew") === "true";
  const isBest = searchParams.get("isBest") === "true";
  const isFeatured = searchParams.get("isFeatured") === "true";
  const onSale = searchParams.get("onSale") === "true";

  const [filters, setFilters] = useState<ProductFilters>({
    q: q || undefined,
    isNew: isNew || undefined,
    isBest: isBest || undefined,
    isFeatured: isFeatured || undefined,
    onSale: onSale || undefined,
    sort: "newest",
    page: 1,
    limit: 24,
  });

  const { data, isLoading } = useProducts(filters);

  const updateFilters = (updates: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ q: q || undefined, sort: "newest", page: 1, limit: 24 });
  };

  const pageTitle = q
    ? `Search results for "${q}"`
    : onSale
    ? "Sale"
    : isFeatured
    ? "Featured Products"
    : isNew
    ? "New Arrivals"
    : isBest
    ? "Best Sellers"
    : "All Products";

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
      {data && (
        <p className="text-sm text-gray-500 mb-6">
          {data.pagination.total} products found
        </p>
      )}

      <div className="flex items-center justify-between mb-6">
        <Sheet>
          <SheetTrigger
            className={`md:hidden ${buttonVariants({ variant: "outline", size: "sm" })}`}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="pt-4">
              <FilterSidebar
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={resetFilters}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Select
          value={filters.sort}
          onValueChange={(v) => v && updateFilters({ sort: v as ProductFilters["sort"] })}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <ProductGrid products={data?.products ?? []} loading={isLoading} />

          {data && data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={!data.pagination.hasPrev}
                onClick={() => updateFilters({ page: (filters.page ?? 1) - 1 })}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={!data.pagination.hasNext}
                onClick={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
