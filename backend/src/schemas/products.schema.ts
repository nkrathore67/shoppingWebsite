import { z } from "zod/v4";

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating", "featured"]).default("newest"),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sizes: z.string().optional(), // comma-separated: "S,M,L"
  colors: z.string().optional(),
  brand: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  isNew: z.coerce.boolean().optional(),
  isBest: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  q: z.string().optional(),
  sellerId: z.string().optional(),
});

export const createProductSchema = z.object({
  sellerId: z.string().optional(),
  name: z.string().min(2).max(255),
  description: z.string().min(10),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  sku: z.string().min(2).max(100),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
  categoryId: z.string(),
  brand: z.string().optional(),
  material: z.string().optional(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  variants: z.array(
    z.object({
      size: z.string(),
      color: z.string().optional(),
      colorHex: z.string().optional(),
      stock: z.number().int().min(0),
      sku: z.string(),
    })
  ).min(1),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductQuery = z.infer<typeof productQuerySchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
