import { prisma } from "../config/database";
import type { AddToCartInput, UpdateCartItemInput } from "../schemas/cart.schema";

const cartInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      price: true,
      comparePrice: true,
      brand: true,
    },
  },
  variant: {
    select: {
      id: true,
      size: true,
      color: true,
      colorHex: true,
      stock: true,
    },
  },
};

export async function getCart(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: cartInclude,
    orderBy: { createdAt: "asc" },
  });
  return items;
}

export async function addToCart(userId: string, input: AddToCartInput) {
  // Check stock
  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
  });
  if (!variant) throw new Error("VARIANT_NOT_FOUND");
  if (variant.stock < input.quantity) throw new Error("INSUFFICIENT_STOCK");

  const existing = await prisma.cartItem.findUnique({
    where: { userId_variantId: { userId, variantId: input.variantId } },
  });

  if (existing) {
    const newQty = existing.quantity + input.quantity;
    if (variant.stock < newQty) throw new Error("INSUFFICIENT_STOCK");
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
      include: cartInclude,
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity,
    },
    include: cartInclude,
  });
}

export async function updateCartItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!item) throw new Error("NOT_FOUND");

  const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId } });
  if (!variant || variant.stock < input.quantity) throw new Error("INSUFFICIENT_STOCK");

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: input.quantity },
    include: cartInclude,
  });
}

export async function removeFromCart(userId: string, itemId: string) {
  const item = await prisma.cartItem.findFirst({ where: { id: itemId, userId } });
  if (!item) throw new Error("NOT_FOUND");
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function clearCart(userId: string) {
  return prisma.cartItem.deleteMany({ where: { userId } });
}
