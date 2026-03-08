import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Order, PaginationMeta } from "@/types";

export function useOrders(page = 1) {
  return useQuery<{ orders: Order[]; pagination: PaginationMeta }>({
    queryKey: ["orders", page],
    queryFn: async () => {
      const { data } = await api.get("/orders", { params: { page } });
      return data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
