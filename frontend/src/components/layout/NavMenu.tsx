"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubCategory {
  label: string;
  href: string;
}

interface NavCategory {
  label: string;
  href: string;
  subCategories: SubCategory[];
}

interface NavMenuProps {
  categories: NavCategory[];
}

export function NavMenu({ categories }: NavMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {categories.map((cat) => (
        <div
          key={cat.label}
          className="relative"
          onMouseEnter={() => setActiveMenu(cat.label)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <Link
            href={cat.href}
            className={cn(
              "flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors rounded-md",
              activeMenu === cat.label && "text-purple-600"
            )}
          >
            {cat.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </Link>

          {/* Mega dropdown */}
          {activeMenu === cat.label && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border bg-white p-4 shadow-lg">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Browse {cat.label}&apos;s
              </p>
              <div className="grid grid-cols-1 gap-0.5">
                {cat.subCategories.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                    onClick={() => setActiveMenu(null)}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
              <Link
                href={cat.href}
                className="mt-3 block text-center text-xs font-medium text-purple-600 hover:underline"
              >
                View All {cat.label}&apos;s →
              </Link>
            </div>
          )}
        </div>
      ))}

      <Link
        href="/search?q=sale"
        className="px-3 py-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
      >
        Sale
      </Link>
    </nav>
  );
}
