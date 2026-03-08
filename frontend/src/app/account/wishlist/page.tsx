"use client";

import { useWishlist } from "@/queries/wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : !data?.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border">
          <Heart className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-lg font-medium text-gray-700">Your wishlist is empty</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Save items you love here</p>
          <Link href="/" className="text-purple-600 font-medium hover:underline">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {data.map((item: { product: Product }) => (
            <ProductCard key={item.product.id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
}
