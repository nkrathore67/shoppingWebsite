"use client";

import { useState } from "react";
import { useProducts } from "@/queries/products";
import { ProductGrid } from "./ProductGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";
import type { ProductFilters } from "@/types";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface GenderProductListingProps {
  gender: string;
  category?: string;
  title?: string;
}

export function GenderProductListing({ gender, category, title }: GenderProductListingProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    gender,
    category,
    sort: "newest",
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useProducts(filters);

  const updateFilters = (updates: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({ gender, category, sort: "newest", page: 1, limit: 20 });
  };

  return (
    <div className="container mx-auto px-4 pb-12">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 py-3 border-b">
        <div className="flex items-center gap-3">
          {/* Mobile filter button */}
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

          <p className="text-sm text-gray-500">
            {data?.pagination.total ?? 0} products
            {title && ` in ${title}`}
          </p>
        </div>

        {/* Sort */}
        <Select
          value={filters.sort}
          onValueChange={(value) => value && updateFilters({ sort: value as ProductFilters["sort"] })}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
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
        {/* Desktop filter sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={updateFilters}
            onReset={resetFilters}
          />
        </aside>

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={data?.products ?? []}
            loading={isLoading}
          />

          {/* Pagination */}
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
