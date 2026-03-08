"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, Search, User, Menu, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { NavMenu } from "./NavMenu";
import { SearchBar } from "./SearchBar";
import { useState } from "react";

const GENDER_CATEGORIES = [
  {
    label: "Men",
    href: "/men",
    subCategories: [
      { label: "New Arrivals", href: "/men/new-arrivals" },
      { label: "Best Sellers", href: "/men/best-sellers" },
      { label: "Casual Wear", href: "/men/casual-wear" },
      { label: "Formal Wear", href: "/men/formal-wear" },
      { label: "Ethnic Wear", href: "/men/ethnic-wear" },
      { label: "Western Wear", href: "/men/western-wear" },
      { label: "Sportswear", href: "/men/sportswear-activewear" },
      { label: "Winter Wear", href: "/men/winter-wear" },
      { label: "Party Wear", href: "/men/party-wear" },
      { label: "Workwear", href: "/men/workwear-office-wear" },
      { label: "Accessories", href: "/men/accessories" },
      { label: "Footwear", href: "/men/footwear" },
      { label: "Sale", href: "/men/sale-discounts" },
    ],
  },
  {
    label: "Women",
    href: "/women",
    subCategories: [
      { label: "New Arrivals", href: "/women/new-arrivals" },
      { label: "Best Sellers", href: "/women/best-sellers" },
      { label: "Ethnic Wear", href: "/women/ethnic-wear" },
      { label: "Western Wear", href: "/women/western-wear" },
      { label: "Casual Wear", href: "/women/casual-wear" },
      { label: "Party Wear", href: "/women/party-wear" },
      { label: "Maternity Wear", href: "/women/maternity-wear" },
      { label: "Plus Size", href: "/women/plus-size" },
      { label: "Sleepwear", href: "/women/sleepwear-loungewear" },
      { label: "Swimwear", href: "/women/swimwear-beachwear" },
      { label: "Accessories", href: "/women/accessories" },
      { label: "Footwear", href: "/women/footwear" },
      { label: "Sale", href: "/women/sale-discounts" },
    ],
  },
  {
    label: "Kids",
    href: "/kids",
    subCategories: [
      { label: "New Arrivals", href: "/kids/new-arrivals" },
      { label: "Best Sellers", href: "/kids/best-sellers" },
      { label: "Casual Wear", href: "/kids/casual-wear" },
      { label: "Ethnic Wear", href: "/kids/ethnic-wear" },
      { label: "Sportswear", href: "/kids/sportswear-activewear" },
      { label: "Winter Wear", href: "/kids/winter-wear" },
      { label: "Summer Wear", href: "/kids/summer-wear" },
      { label: "Accessories", href: "/kids/accessories" },
      { label: "Footwear", href: "/kids/footwear" },
      { label: "Sale", href: "/kids/sale-discounts" },
    ],
  },
];

export function Header() {
  const { data: session } = useSession();
  const totalItems = useCartStore((s) => s.totalItems);
  const openCart = useCartStore((s) => s.openCart);
  const { isMobileMenuOpen, openMobileMenu, closeMobileMenu } = useUIStore();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-purple-600" />
          <span className="text-xl font-bold text-gray-900">ThikanaWear</span>
        </Link>

        {/* Desktop Nav */}
        <NavMenu categories={GENDER_CATEGORIES} />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch((v) => !v)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Wishlist */}
          <Link href="/account/wishlist">
            <Button variant="ghost" size="icon" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems() > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-purple-600 p-0 text-xs text-white">
                {totalItems()}
              </Badge>
            )}
          </Button>

          {/* User */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({ variant: "ghost", size: "icon" })}
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{session.user?.name}</p>
                  <p className="text-xs text-gray-500">{session.user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/account" />}>
                  My Account
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/orders" />}>
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/account/wishlist" />}>
                  Wishlist
                </DropdownMenuItem>
                {(session.user as { role?: string })?.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/admin" />}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" aria-label="Sign In">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search bar overlay */}
      {showSearch && (
        <div className="border-t bg-white px-4 py-3">
          <SearchBar onClose={() => setShowSearch(false)} />
        </div>
      )}
    </header>
  );
}
