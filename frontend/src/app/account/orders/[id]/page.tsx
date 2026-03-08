"use client";

import { use } from "react";
import { useOrder } from "@/queries/orders";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  UNPAID: "bg-orange-100 text-orange-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="h-16 w-16 text-gray-200 mb-4" />
        <p className="text-lg font-medium text-gray-700">Order not found</p>
        <Link href="/account/orders" className="text-purple-600 hover:underline mt-2">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/account/orders"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {format(new Date(order.createdAt), "d MMMM yyyy, h:mm a")}
          </p>
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-white rounded-xl border p-5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
            {order.paymentStatus}
          </span>
        </div>
        {order.trackingNumber && (
          <p className="text-sm text-gray-600">
            Tracking: <span className="font-mono font-medium">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">
          {order.items.length} Item{order.items.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src={item.product.images?.[0] || `https://picsum.photos/seed/${item.product.slug}/160/200`}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.product.id}`}
                  className="font-medium text-gray-900 hover:text-purple-600 line-clamp-1"
                >
                  {item.product.name}
                </Link>
                {item.product.brand && (
                  <p className="text-xs text-purple-600 mt-0.5">{item.product.brand}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Size: {item.variant.size}
                  {item.variant.color && ` · ${item.variant.color}`}
                </p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatPrice(item.total)}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Delivery address */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p>{order.address.street}</p>
            <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
            <p>{order.address.country}</p>
            {order.address.phone && <p>{order.address.phone}</p>}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Price Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-gray-900 text-base">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
