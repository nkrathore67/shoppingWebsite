import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Product, ProductFilters, PaginationMeta } from "@/types";

interface ProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", filters],
    queryFn: async () => {
      const { data } = await api.get("/products", { params: filters });
      return data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRelatedProducts(productId: string) {
  return useQuery<Product[]>({
    queryKey: ["relatedProducts", productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}/related`);
      return data;
    },
    enabled: !!productId,
  });
}

export function useFeaturedProducts() {
  return useQuery<Product[]>({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const { data } = await api.get("/products/featured");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNewArrivals() {
  return useQuery<Product[]>({
    queryKey: ["newArrivals"],
    queryFn: async () => {
      const { data } = await api.get("/products/new-arrivals");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBestSellers() {
  return useQuery<Product[]>({
    queryKey: ["bestSellers"],
    queryFn: async () => {
      const { data } = await api.get("/products/best-sellers");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
