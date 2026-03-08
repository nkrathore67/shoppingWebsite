"use client";

import Link from "next/link";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const MOBILE_LINKS = [
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "Kids", href: "/kids" },
  { label: "New Arrivals", href: "/search?isNew=true" },
  { label: "Best Sellers", href: "/search?isBest=true" },
  { label: "Sale", href: "/search?onSale=true" },
  { label: "My Account", href: "/account" },
  { label: "My Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
];

export function MobileNav() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

  return (
    <>
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="border-b px-4 py-4">
            <p className="text-lg font-semibold text-gray-900">ThikanaWear</p>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {MOBILE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center justify-between px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
