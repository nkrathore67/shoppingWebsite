import Link from "next/link";
import { ShoppingBag, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold text-white">StyleHub</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your one-stop destination for the latest fashion trends for men,
              women, and kids.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/men" className="hover:text-white transition-colors">Men</Link></li>
              <li><Link href="/women" className="hover:text-white transition-colors">Women</Link></li>
              <li><Link href="/kids" className="hover:text-white transition-colors">Kids</Link></li>
              <li><Link href="/search?isFeatured=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/search?isBest=true" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link href="/search?q=sale" className="hover:text-white transition-colors text-red-400">Sale</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="hover:text-white transition-colors">My Profile</Link></li>
              <li><Link href="/account/orders" className="hover:text-white transition-colors">My Orders</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
              <li><Link href="/account/addresses" className="hover:text-white transition-colors">Saved Addresses</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} StyleHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
