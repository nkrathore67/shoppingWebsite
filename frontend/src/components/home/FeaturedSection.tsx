"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types";

interface FeaturedSectionProps {
  title: string;
  products: Product[];
  loading?: boolean;
  viewAllHref?: string;
}

export function FeaturedSection({
  title,
  products,
  loading,
  viewAllHref,
}: FeaturedSectionProps) {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {viewAllHref && (
          <Button variant="outline" asChild>
            <Link href={viewAllHref}>View All</Link>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
