"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { useCart } from "@/queries/cart";
import { CartItem } from "@/components/cart/CartItem";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const { data: session } = useSession();
  const { data: cartItems } = useCart();
  const { items, setItems, totalPrice } = useCartStore();

  useEffect(() => {
    if (cartItems && session) setItems(cartItems);
  }, [cartItems, session, setItems]);

  const subtotal = totalPrice();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart ({items.length} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-20 w-20 text-gray-200 mb-4" />
          <p className="text-xl font-medium text-gray-700 mb-2">Your cart is empty</p>
          <p className="text-gray-500 mb-6">Add items to get started</p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border">
                <CartItem item={item} />
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border sticky top-20">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-500">
                    Add {formatPrice(999 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button
                asChild
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 h-12"
              >
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>

              <Button variant="outline" asChild className="w-full mt-3">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
