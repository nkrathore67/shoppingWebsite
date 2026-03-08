"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductFilters } from "@/types";

interface FilterSidebarProps {
  filters: ProductFilters;
  onFiltersChange: (filters: Partial<ProductFilters>) => void;
  onReset: () => void;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = ["Black", "White", "Navy", "Red", "Blue", "Green", "Grey", "Beige", "Pink", "Brown"];

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b py-4">
      <button
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-900"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const selectedSizes = filters.sizes ? filters.sizes.split(",") : [];
  const selectedColors = filters.colors ? filters.colors.split(",") : [];
  const priceRange = [filters.minPrice ?? 0, filters.maxPrice ?? 5000];

  const toggleSize = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    onFiltersChange({ sizes: updated.length ? updated.join(",") : undefined });
  };

  const toggleColor = (color: string) => {
    const updated = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    onFiltersChange({ colors: updated.length ? updated.join(",") : undefined });
  };

  const hasActiveFilters =
    filters.sizes || filters.colors || filters.minPrice || filters.maxPrice || filters.rating;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="text-red-500 h-7 px-2" onClick={onReset}>
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <Slider
            min={0}
            max={5000}
            step={100}
            value={priceRange}
            onValueChange={(values) => {
              const [min, max] = Array.isArray(values) ? values : [values, values];
              onFiltersChange({ minPrice: min || undefined, maxPrice: max < 5000 ? max : undefined });
            }}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}{priceRange[1] >= 5000 ? "+" : ""}</span>
          </div>
        </div>
      </FilterSection>

      {/* Sizes */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                selectedSizes.includes(size)
                  ? "border-purple-600 bg-purple-50 text-purple-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div className="space-y-2">
          {COLORS.map((color) => (
            <div key={color} className="flex items-center gap-2">
              <Checkbox
                id={`color-${color}`}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => toggleColor(color)}
              />
              <Label htmlFor={`color-${color}`} className="text-sm text-gray-700 cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Min Rating">
        <div className="space-y-2">
          {[4, 3, 2].map((rating) => (
            <div key={rating} className="flex items-center gap-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={filters.rating === rating}
                onCheckedChange={(checked) =>
                  onFiltersChange({ rating: checked ? rating : undefined })
                }
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm text-gray-700 cursor-pointer">
                {"★".repeat(rating)}{"☆".repeat(5 - rating)} & above
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Others */}
      <FilterSection title="Special">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="isNew"
              checked={!!filters.isNew}
              onCheckedChange={(checked) => onFiltersChange({ isNew: checked ? true : undefined })}
            />
            <Label htmlFor="isNew" className="text-sm text-gray-700 cursor-pointer">New Arrivals</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isBest"
              checked={!!filters.isBest}
              onCheckedChange={(checked) => onFiltersChange({ isBest: checked ? true : undefined })}
            />
            <Label htmlFor="isBest" className="text-sm text-gray-700 cursor-pointer">Best Sellers</Label>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}
