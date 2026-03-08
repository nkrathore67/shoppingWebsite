import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag } from "lucide-react";

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Users", href: "/admin/users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-purple-400" />
            <span className="font-bold text-lg">StyleHub Admin</span>
          </Link>
        </div>
        <nav className="px-3 space-y-1">
          {ADMIN_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
