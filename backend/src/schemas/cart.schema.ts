import { z } from "zod/v4";

export const addToCartSchema = z.object({
  productId: z.string(),
  variantId: z.string(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
