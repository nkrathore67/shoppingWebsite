import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenderProductListing } from "@/components/product/GenderProductListing";
import { slugToTitle } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const VALID_GENDERS = ["men", "women", "kids"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gender: string; category: string }>;
}): Promise<Metadata> {
  const { gender, category } = await params;
  const title = `${slugToTitle(category)} — ${slugToTitle(gender)}'s Collection`;
  return { title, description: `Shop ${gender}'s ${slugToTitle(category)} at StyleHub` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ gender: string; category: string }>;
}) {
  const { gender, category } = await params;

  if (!VALID_GENDERS.includes(gender)) notFound();

  const genderLabel = slugToTitle(gender);
  const categoryLabel = slugToTitle(category);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/${gender}`} className="hover:text-gray-700">{genderLabel}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 font-medium">{categoryLabel}</span>
        </nav>
      </div>

      {/* Page title */}
      <div className="container mx-auto px-4 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {genderLabel}&apos;s {categoryLabel}
        </h1>
      </div>

      {/* Products */}
      <GenderProductListing
        gender={gender.toUpperCase()}
        category={category}
        title={categoryLabel}
      />
    </div>
  );
}
