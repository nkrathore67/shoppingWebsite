"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProduct, useRelatedProducts } from "@/queries/products";
import { useAddToCart } from "@/queries/cart";
import { useToggleWishlist } from "@/queries/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatPrice, calculateDiscount, getStarArray } from "@/lib/utils";
import { Heart, ShoppingBag, Star, ChevronRight, Truck, RefreshCw, Shield } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { cn } from "@/lib/utils";

interface ProductDetailClientProps {
  productId: string;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const { data: product, isLoading } = useProduct(productId);
  const { data: related } = useRelatedProducts(productId);
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate: addToCart, isPending: addingToCart } = useAddToCart();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(productId));
  const openCart = useCartStore((s) => s.openCart);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[3/4] rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Product not found</p>
        <Link href="/" className="text-purple-600 hover:underline mt-2 block">
          Back to home
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const discount = calculateDiscount(product.price, product.comparePrice);
  const stars = getStarArray(product.rating);

  const handleAddToCart = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!selectedVariantId) return;
    addToCart(
      { productId, variantId: selectedVariantId, quantity: 1 },
      { onSuccess: openCart }
    );
  };

  const handleWishlist = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    toggleWishlist({ productId, inWishlist: isInWishlist });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${product.gender.toLowerCase()}`} className="hover:text-gray-700 capitalize">
          {product.gender.toLowerCase()}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={product.images?.[mainImage] || `https://picsum.photos/seed/${product.slug}/600/800`}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {discount > 0 && (
              <Badge className="absolute left-4 top-4 bg-red-500 text-white">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={cn(
                    "relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors",
                    i === mainImage ? "border-purple-600" : "border-transparent"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          {product.brand && (
            <p className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              {product.brand}
            </p>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {stars.map((type, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      type === "full" ? "fill-amber-400 text-amber-400" :
                      type === "half" ? "fill-amber-200 text-amber-400" :
                      "text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge variant="secondary" className="text-green-700 bg-green-100">
                  {discount}% OFF
                </Badge>
              </>
            )}
          </div>

          <Separator />

          {/* Size selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Select Size</p>
              <button className="text-xs text-purple-600 hover:underline">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={variant.stock === 0}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors",
                    selectedVariantId === variant.id
                      ? "border-purple-600 bg-purple-50 text-purple-600"
                      : variant.stock === 0
                      ? "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                      : "border-gray-200 text-gray-700 hover:border-gray-400"
                  )}
                >
                  {variant.size}
                </button>
              ))}
            </div>
            {selectedVariant && (
              <p className="mt-2 text-xs text-gray-500">
                {selectedVariant.stock} items in stock
              </p>
            )}
          </div>

          {/* Color */}
          {selectedVariant?.color && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Color: <span className="font-normal">{selectedVariant.color}</span>
              </p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 h-12"
              disabled={!selectedVariantId || addingToCart}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {!selectedVariantId ? "Select Size" : addingToCart ? "Adding..." : "Add to Cart"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-2"
              onClick={handleWishlist}
              aria-label="Wishlist"
            >
              <Heart
                className={cn("h-5 w-5", isInWishlist ? "fill-red-500 text-red-500" : "")}
              />
            </Button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.isNewArrival && <Badge className="bg-green-500">New Arrival</Badge>}
            {product.isBestSeller && <Badge className="bg-orange-500">Best Seller</Badge>}
          </div>

          {/* Description */}
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Product Details</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            {product.material && (
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Material:</span> {product.material}
              </p>
            )}
          </div>

          {/* Shipping info */}
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="h-4 w-4 text-green-600" />
              <span>Free shipping on orders above ₹999</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span>Easy 30-day returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-purple-600" />
              <span>100% authentic products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
