import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data;
    },
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, inWishlist }: { productId: string; inWishlist: boolean }) => {
      if (inWishlist) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post("/wishlist", { productId });
      }
    },
    onSuccess: (_, { inWishlist }) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    },
  });
}
