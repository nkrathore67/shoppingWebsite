"use client";

import { FeaturedSection } from "./FeaturedSection";
import { useFeaturedProducts, useNewArrivals, useBestSellers } from "@/queries/products";

export function HomeProductSections() {
  const { data: featured, isLoading: loadingFeatured } = useFeaturedProducts();
  const { data: newArrivals, isLoading: loadingNew } = useNewArrivals();
  const { data: bestSellers, isLoading: loadingBest } = useBestSellers();

  return (
    <>
      <FeaturedSection
        title="Featured Products"
        products={featured || []}
        loading={loadingFeatured}
        viewAllHref="/search?isFeatured=true"
      />
      <div className="bg-white">
        <FeaturedSection
          title="New Arrivals"
          products={newArrivals || []}
          loading={loadingNew}
          viewAllHref="/search?isNew=true"
        />
      </div>
      <FeaturedSection
        title="Best Sellers"
        products={bestSellers || []}
        loading={loadingBest}
        viewAllHref="/search?isBest=true"
      />
    </>
  );
}
