import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/products/${id}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return {};
    const product = await res.json();
    return {
      title: product.name,
      description: product.description?.slice(0, 160),
      openGraph: {
        images: product.images?.[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailClient productId={id} />;
}
