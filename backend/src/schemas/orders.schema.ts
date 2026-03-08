import { z } from "zod/v4";

export const createOrderSchema = z.object({
  addressId: z.string(),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  trackingNumber: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
