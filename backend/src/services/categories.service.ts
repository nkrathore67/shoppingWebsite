import { prisma } from "../config/database";
import { Gender } from "../generated/prisma/client";

export async function getAllCategories(gender?: string) {
  return prisma.category.findMany({
    where: {
      parentCategoryId: null,
      isActive: true,
      ...(gender && { gender: gender as Gender }),
    },
    include: {
      subCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoriesByGender(genderSlug: string) {
  const genderMap: Record<string, Gender> = {
    men: "MEN",
    women: "WOMEN",
    kids: "KIDS",
  };
  const gender = genderMap[genderSlug.toLowerCase()];
  if (!gender) return null;

  const parent = await prisma.category.findFirst({
    where: { gender, parentCategoryId: null, isActive: true },
    include: {
      subCategories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return parent;
}

export async function getCategoryBySlug(genderSlug: string, categorySlug: string) {
  const genderMap: Record<string, Gender> = {
    men: "MEN",
    women: "WOMEN",
    kids: "KIDS",
  };
  const gender = genderMap[genderSlug.toLowerCase()];
  if (!gender) return null;

  return prisma.category.findFirst({
    where: { slug: categorySlug, gender, isActive: true },
  });
}

export async function createCategory(data: {
  name: string;
  slug: string;
  gender?: Gender;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string;
  sortOrder?: number;
}) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: Partial<{
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}>) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.update({ where: { id }, data: { isActive: false } });
}
