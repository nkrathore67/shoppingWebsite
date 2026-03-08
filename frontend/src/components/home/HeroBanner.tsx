"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    id: 1,
    title: "New Season Arrivals",
    subtitle: "Discover the latest trends in men's, women's, and kids' fashion",
    cta: "Shop New Arrivals",
    href: "/search?isNew=true",
    bg: "from-purple-900 to-purple-600",
    image: "https://picsum.photos/seed/hero-fashion-1/1200/600",
  },
  {
    id: 2,
    title: "Ethnic Wear Collection",
    subtitle: "Celebrate the beauty of traditional fashion with our curated collection",
    cta: "Explore Ethnic Wear",
    href: "/women/ethnic-wear",
    bg: "from-amber-900 to-amber-600",
    image: "https://picsum.photos/seed/hero-ethnic-2/1200/600",
  },
  {
    id: 3,
    title: "Up to 50% Off",
    subtitle: "Grab amazing deals on premium brands. Limited time offer!",
    cta: "Shop the Sale",
    href: "/search?onSale=true",
    bg: "from-red-900 to-red-600",
    image: "https://picsum.photos/seed/hero-sale-3/1200/600",
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-4 h-[340px] md:h-[480px] lg:h-[560px]">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-all duration-700`} />

      {/* Image overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-all duration-700"
        style={{ backgroundImage: `url(${slide.image})` }}
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-start justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-xl text-white">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            {slide.title}
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-6">
            {slide.subtitle}
          </p>
          <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
            <Link href={slide.href}>{slide.cta}</Link>
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors backdrop-blur-sm"
        onClick={() => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 transition-colors backdrop-blur-sm"
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === current ? "w-6 bg-white" : "w-2 bg-white/50"
            )}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
