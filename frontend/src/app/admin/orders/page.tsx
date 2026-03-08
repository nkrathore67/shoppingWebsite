"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Order, PaginationMeta } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ orders: (Order & { user: { name: string; email: string } })[]; pagination: PaginationMeta }>({
    queryKey: ["adminOrders", page],
    queryFn: async () => {
      const { data } = await api.get("/admin/orders", { params: { page, limit: 20 } });
      return data;
    },
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      api.patch(`/admin/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success("Order status updated");
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              : data?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-mono font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500">{order.items.length} items</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                      <p className="text-xs text-gray-500">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.createdAt), "d MMM yyyy")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={order.status}
                        onValueChange={(status) => status && updateStatus({ orderId: order.id, status })}
                      >
                        <SelectTrigger className={`w-36 text-xs h-8 ${STATUS_COLORS[order.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].map(
                            (s) => <SelectItem key={s} value={s}>{s}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {data && data.pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <Button variant="outline" size="sm" disabled={!data.pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="flex items-center text-sm text-gray-600 px-2">{page} / {data.pagination.totalPages}</span>
            <Button variant="outline" size="sm" disabled={!data.pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
