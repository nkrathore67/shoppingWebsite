import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenderProductListing } from "@/components/product/GenderProductListing";

const GENDER_DATA: Record<string, {
  title: string;
  description: string;
  image: string;
  subCategories: Array<{ label: string; slug: string }>;
}> = {
  men: {
    title: "Men's Fashion",
    description: "Discover the latest trends in men's clothing",
    image: "https://picsum.photos/seed/men-hero/1200/400",
    subCategories: [
      { label: "New Arrivals", slug: "new-arrivals" },
      { label: "Best Sellers", slug: "best-sellers" },
      { label: "Casual Wear", slug: "casual-wear" },
      { label: "Formal Wear", slug: "formal-wear" },
      { label: "Ethnic Wear", slug: "ethnic-wear" },
      { label: "Western Wear", slug: "western-wear" },
      { label: "Sportswear", slug: "sportswear-activewear" },
      { label: "Winter Wear", slug: "winter-wear" },
      { label: "Party Wear", slug: "party-wear" },
      { label: "Workwear", slug: "workwear-office-wear" },
      { label: "Sleepwear", slug: "sleepwear-loungewear" },
      { label: "Innerwear", slug: "innerwear-lingerie" },
      { label: "Accessories", slug: "accessories" },
      { label: "Footwear", slug: "footwear" },
      { label: "Plus Size", slug: "plus-size" },
      { label: "Sale", slug: "sale-discounts" },
    ],
  },
  women: {
    title: "Women's Fashion",
    description: "Explore beautiful styles for every occasion",
    image: "https://picsum.photos/seed/women-hero/1200/400",
    subCategories: [
      { label: "New Arrivals", slug: "new-arrivals" },
      { label: "Best Sellers", slug: "best-sellers" },
      { label: "Ethnic Wear", slug: "ethnic-wear" },
      { label: "Western Wear", slug: "western-wear" },
      { label: "Casual Wear", slug: "casual-wear" },
      { label: "Formal Wear", slug: "formal-wear" },
      { label: "Party Wear", slug: "party-wear" },
      { label: "Maternity Wear", slug: "maternity-wear" },
      { label: "Plus Size", slug: "plus-size" },
      { label: "Sleepwear", slug: "sleepwear-loungewear" },
      { label: "Swimwear", slug: "swimwear-beachwear" },
      { label: "Workwear", slug: "workwear-office-wear" },
      { label: "Innerwear", slug: "innerwear-lingerie" },
      { label: "Accessories", slug: "accessories" },
      { label: "Footwear", slug: "footwear" },
      { label: "Sale", slug: "sale-discounts" },
    ],
  },
  kids: {
    title: "Kids' Fashion",
    description: "Adorable and comfortable clothing for little ones",
    image: "https://picsum.photos/seed/kids-hero/1200/400",
    subCategories: [
      { label: "New Arrivals", slug: "new-arrivals" },
      { label: "Best Sellers", slug: "best-sellers" },
      { label: "Casual Wear", slug: "casual-wear" },
      { label: "Ethnic Wear", slug: "ethnic-wear" },
      { label: "Sportswear", slug: "sportswear-activewear" },
      { label: "Winter Wear", slug: "winter-wear" },
      { label: "Summer Wear", slug: "summer-wear" },
      { label: "Party Wear", slug: "party-wear" },
      { label: "Sleepwear", slug: "sleepwear-loungewear" },
      { label: "Innerwear", slug: "innerwear-lingerie" },
      { label: "Accessories", slug: "accessories" },
      { label: "Footwear", slug: "footwear" },
      { label: "Plus Size", slug: "plus-size" },
      { label: "Sale", slug: "sale-discounts" },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender: string }>;
}): Promise<Metadata> {
  const { gender } = await params;
  const data = GENDER_DATA[gender];
  if (!data) return {};
  return {
    title: data.title,
    description: data.description,
  };
}

export default async function GenderPage({
  params,
}: {
  params: Promise<{ gender: string }>;
}) {
  const { gender } = await params;
  const data = GENDER_DATA[gender];
  if (!data) notFound();

  return (
    <div>
      {/* Hero banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <Image
          src={data.image}
          alt={data.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center px-8">
          <div className="text-white">
            <h1 className="text-3xl md:text-4xl font-bold">{data.title}</h1>
            <p className="text-white/80 mt-1">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Sub-category chips */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2">
          {data.subCategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/${gender}/${sub.slug}`}
              className="px-4 py-1.5 text-sm font-medium rounded-full border border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Products */}
      <GenderProductListing gender={gender.toUpperCase()} />
    </div>
  );
}
