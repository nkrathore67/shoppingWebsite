import { prisma } from "../config/database";
import { getPaginationParams, buildPaginationMeta } from "../utils/pagination";
import { slugify } from "../utils/slugify";
import type { ProductQuery, CreateProductInput, UpdateProductInput } from "../schemas/products.schema";
import { Prisma } from "../generated/prisma/client";

export async function getProducts(query: ProductQuery) {
  const { page, limit, skip } = getPaginationParams(query);

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (query.sellerId) where.sellerId = query.sellerId;
  if (query.gender) where.gender = query.gender;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { brand: { contains: query.q, mode: "insensitive" } },
      { tags: { has: query.q } },
    ];
  }
  if (query.category) {
    where.category = { slug: query.category };
  }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) where.price.gte = query.minPrice;
    if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
  }
  if (query.brand) where.brand = { contains: query.brand, mode: "insensitive" };
  if (query.rating) where.rating = { gte: query.rating };
  if (query.isNew) where.isNewArrival = true;
  if (query.isBest) where.isBestSeller = true;
  if (query.isFeatured) where.isFeatured = true;

  if (query.sizes) {
    const sizes = query.sizes.split(",");
    where.variants = { some: { size: { in: sizes }, stock: { gt: 0 } } };
  }
  if (query.colors) {
    const colors = query.colors.split(",");
    where.variants = { some: { color: { in: colors } } };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput = (() => {
    switch (query.sort) {
      case "price_asc": return { price: "asc" };
      case "price_desc": return { price: "desc" };
      case "rating": return { rating: "desc" };
      case "featured": return { isFeatured: "desc" };
      default: return { createdAt: "desc" };
    }
  })();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, size: true, color: true, colorHex: true, stock: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id, isActive: true },
    include: {
      category: true,
      variants: true,
      reviews: {
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });
}

export async function getRelatedProducts(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return [];
  return prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      gender: product.gender,
      id: { not: productId },
      isActive: true,
    },
    take: 8,
    include: { variants: { select: { id: true, size: true, color: true, stock: true } } },
  });
}

export async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    take: 12,
    include: { variants: { select: { id: true, size: true, color: true, stock: true } } },
  });
}

export async function getNewArrivals() {
  return prisma.product.findMany({
    where: { isNewArrival: true, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { variants: { select: { id: true, size: true, color: true, stock: true } } },
  });
}

export async function getBestSellers() {
  return prisma.product.findMany({
    where: { isBestSeller: true, isActive: true },
    take: 12,
    include: { variants: { select: { id: true, size: true, color: true, stock: true } } },
  });
}

export async function createProduct(input: CreateProductInput & { sellerId?: string }) {
  const slug = slugify(input.name);
  const { variants, sellerId, ...productData } = input;

  return prisma.product.create({
    data: {
      ...productData,
      slug,
      ...(sellerId && { sellerId }),
      totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      variants: { create: variants },
    },
    include: { variants: true },
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const { variants, ...productData } = input;

  return prisma.product.update({
    where: { id },
    data: {
      ...productData,
      ...(variants && {
        variants: {
          deleteMany: {},
          create: variants,
        },
        totalStock: variants.reduce((sum, v) => sum + v.stock, 0),
      }),
    },
    include: { variants: true },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

export async function toggleProductActive(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
}
