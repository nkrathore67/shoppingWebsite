import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
});

export const addressSchema = z.object({
  label: z.string().default("Home"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(4),
  country: z.string().default("IN"),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
