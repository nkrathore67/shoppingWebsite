"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToggleWishlist } from "@/queries/wishlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const { mutate: toggleWishlist, isPending } = useToggleWishlist();

  const discount = calculateDiscount(product.price, product.comparePrice);
  const mainImage = product.images?.[0] || `https://picsum.photos/seed/${product.slug}/400/500`;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      router.push("/login");
      return;
    }
    toggleWishlist({ productId: product.id, inWishlist: isInWishlist });
  };

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link href={`/products/${product.id}`} className="relative overflow-hidden rounded-xl bg-gray-100">
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNewArrival && (
            <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-orange-500 text-white text-xs">BESTSELLER</Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-red-500 text-white text-xs">{discount}% OFF</Badge>
          )}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleWishlist}
          disabled={isPending}
          aria-label="Toggle wishlist"
        >
          <Heart
            className={cn("h-4 w-4", isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600")}
          />
        </Button>
      </Link>

      {/* Product info */}
      <div className="mt-3 flex flex-col gap-1 flex-1">
        {product.brand && (
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {product.brand}
          </p>
        )}
        <Link href={`/products/${product.id}`} className="hover:text-purple-600 transition-colors">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.name}
          </p>
        </Link>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
