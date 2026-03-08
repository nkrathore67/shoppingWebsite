import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  productIds: string[];
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setProductIds: (ids: string[]) => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      addProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId],
        })),

      removeProduct: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId),
        })),

      isInWishlist: (productId) => get().productIds.includes(productId),

      setProductIds: (ids) => set({ productIds: ids }),
    }),
    {
      name: "wishlist",
    }
  )
);
