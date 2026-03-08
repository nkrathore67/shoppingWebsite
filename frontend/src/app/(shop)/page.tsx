import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HomeProductSections } from "@/components/home/HomeProductSections";

export const metadata: Metadata = {
  title: "ThikanaWear — Fashion for Everyone",
  description:
    "Discover the latest trends in men's, women's, and kids' fashion at ThikanaWear.",
};

export default function HomePage() {
  return (
    <div className="bg-gray-50 pb-16">
      <HeroBanner />
      <CategoryGrid />
      <HomeProductSections />

      {/* Promo banner */}
      <section className="container mx-auto px-4 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Free Shipping on Orders Above ₹999</h2>
          <p className="text-white/80 mb-6">Use code WELCOME10 for 10% off your first order</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="/men"
              className="rounded-full bg-white text-purple-600 px-6 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Men
            </a>
            <a
              href="/women"
              className="rounded-full bg-white text-purple-600 px-6 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Women
            </a>
            <a
              href="/kids"
              className="rounded-full bg-white text-purple-600 px-6 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Kids
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
