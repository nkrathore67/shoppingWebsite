import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Link from "next/link";
import { User, Package, MapPin, Heart } from "lucide-react";

const ACCOUNT_LINKS = [
  { label: "My Profile", href: "/account", icon: User },
  { label: "My Orders", href: "/account/orders", icon: Package },
  { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
  { label: "My Wishlist", href: "/account/wishlist", icon: Heart },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <MobileNav />
      <CartDrawer />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                My Account
              </p>
              <nav className="space-y-1">
                {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
