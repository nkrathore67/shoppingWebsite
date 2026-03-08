import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  comparePrice?: number;
  brand?: string;
}

export interface CartVariant {
  id: string;
  size: string;
  color?: string;
  colorHex?: string;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: CartProduct;
  variant: CartVariant;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (itemId) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),
    }),
    {
      name: "shopping-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
