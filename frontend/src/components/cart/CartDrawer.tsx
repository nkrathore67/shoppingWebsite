"use client";

import { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cartStore";
import { useCart } from "@/queries/cart";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";

export function CartDrawer() {
  const { data: session } = useSession();
  const { isOpen, closeCart, setItems, totalPrice } = useCartStore();
  const { data: cartItems } = useCart();

  useEffect(() => {
    if (cartItems && session) {
      setItems(cartItems);
    }
  }, [cartItems, session, setItems]);

  const items = useCartStore((s) => s.items);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-purple-600" />
            Your Cart ({items.length} items)
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="h-16 w-16 text-gray-200" />
              <div>
                <p className="font-medium text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add items to get started</p>
              </div>
              <Button asChild onClick={closeCart}>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-4 space-y-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping and taxes calculated at checkout
            </p>
            <Separator />
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700" onClick={closeCart}>
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild onClick={closeCart}>
                <Link href="/cart">View Cart</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
