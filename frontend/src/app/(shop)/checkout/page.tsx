"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { Address } from "@/types";
import { MapPin, CreditCard } from "lucide-react";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [step, setStep] = useState<"address" | "payment">("address");

  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get("/users/me/addresses");
      return data;
    },
    enabled: !!session,
  });

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/orders", { addressId: selectedAddressId });
      return data;
    },
    onSuccess: (order) => {
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?orderId=${order.id}`);
    },
    onError: () => toast.error("Failed to place order"),
  });

  const subtotal = totalPrice();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg text-gray-600">Your cart is empty</p>
        <Button asChild className="mt-4 bg-purple-600 hover:bg-purple-700">
          <a href="/">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {["address", "payment"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium capitalize ${step === s ? "text-purple-600" : "text-gray-500"}`}>
              {s === "address" ? "Delivery Address" : "Review & Pay"}
            </span>
            {i < 1 && <span className="text-gray-300 mx-2">→</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "address" && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Select Delivery Address</h2>
              </div>

              {addresses?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses saved</p>
                  <Button asChild variant="outline">
                    <a href="/account/addresses">Add Address</a>
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {addresses?.map((address) => (
                  <label
                    key={address.id}
                    className={`block border-2 rounded-xl p-4 cursor-pointer transition-colors ${selectedAddressId === address.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{address.label}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.firstName} {address.lastName}, {address.street}, {address.city}, {address.state} - {address.zip}
                        </p>
                        {address.phone && <p className="text-sm text-gray-500">{address.phone}</p>}
                      </div>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              <Button
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
                disabled={!selectedAddressId}
                onClick={() => setStep("payment")}
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Review & Place Order</h2>
              </div>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.variant.size} | Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Payment will be processed securely. (Stripe integration available with valid API keys)
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("address")}>Back</Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={isPending}
                  onClick={() => placeOrder()}
                >
                  {isPending ? "Placing Order..." : `Place Order • ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className={shipping === 0 ? "text-green-600" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
