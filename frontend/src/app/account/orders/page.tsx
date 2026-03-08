"use client";

import { useOrders } from "@/queries/orders";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package } from "lucide-react";
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

export default function OrdersPage() {
  const { data, isLoading } = useOrders();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !data?.orders.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border">
          <Package className="h-16 w-16 text-gray-200 mb-4" />
          <p className="text-lg font-medium text-gray-700">No orders yet</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">When you place orders, they&apos;ll appear here</p>
          <Link
            href="/"
            className="text-purple-600 font-medium hover:underline"
          >
            Start Shopping →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-mono text-gray-500">#{order.id.slice(-8).toUpperCase()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(order.createdAt), "d MMM yyyy")}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-purple-600 mt-1 hover:underline">View Details →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
