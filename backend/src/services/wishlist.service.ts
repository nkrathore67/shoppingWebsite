import { prisma } from "../config/database";

const wishlistInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      comparePrice: true,
      rating: true,
      reviewCount: true,
      brand: true,
      variants: {
        select: { id: true, size: true, color: true, stock: true },
      },
    },
  },
};

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: wishlistInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("PRODUCT_NOT_FOUND");

  return prisma.wishlist.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
    include: wishlistInclude,
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  const item = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (!item) throw new Error("NOT_FOUND");
  return prisma.wishlist.delete({ where: { userId_productId: { userId, productId } } });
}
