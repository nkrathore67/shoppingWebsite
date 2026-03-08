import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  className?: string;
}

export function ProductGrid({ products, loading, className }: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-4xl mb-3">👗</p>
        <p className="text-lg font-medium text-gray-700">No products found</p>
        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
