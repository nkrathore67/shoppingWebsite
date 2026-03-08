import Link from "next/link";
import { LayoutDashboard, Package, PlusCircle, Store } from "lucide-react";

const SELLER_LINKS = [
  { label: "Dashboard", href: "/seller", icon: LayoutDashboard },
  { label: "My Products", href: "/seller/products", icon: Package },
  { label: "Add Product", href: "/seller/products/new", icon: PlusCircle },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-emerald-900 text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-emerald-300" />
            <span className="font-bold text-lg">Seller Portal</span>
          </Link>
        </div>
        <nav className="px-3 space-y-1">
          {SELLER_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-100 hover:bg-emerald-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-300 hover:text-white"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
