import { prisma } from "../config/database";
import { getPaginationParams, buildPaginationMeta } from "../utils/pagination";
import { Prisma } from "../generated/prisma/client";

export async function searchProducts(params: {
  q: string;
  gender?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { page, limit, skip } = getPaginationParams(params);

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    OR: [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
      { brand: { contains: params.q, mode: "insensitive" } },
      { tags: { has: params.q } },
    ],
  };

  if (params.gender) where.gender = params.gender as never;
  if (params.category) where.category = { slug: params.category };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: { select: { id: true, size: true, color: true, stock: true } },
      },
      orderBy: { rating: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getSearchSuggestions(q: string) {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, slug: true, images: true },
    take: 8,
  });

  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: "insensitive" },
    },
    select: { id: true, name: true, slug: true, gender: true },
    take: 4,
  });

  return { products, categories };
}
