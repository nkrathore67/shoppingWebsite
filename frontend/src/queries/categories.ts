import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Category } from "@/types";

export function useCategories(gender?: string) {
  return useQuery<Category[]>({
    queryKey: ["categories", gender],
    queryFn: async () => {
      const { data } = await api.get("/categories", { params: gender ? { gender } : {} });
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryByGender(genderSlug: string) {
  return useQuery<Category>({
    queryKey: ["category", genderSlug],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${genderSlug}`);
      return data;
    },
    enabled: !!genderSlug,
    staleTime: 10 * 60 * 1000,
  });
}
