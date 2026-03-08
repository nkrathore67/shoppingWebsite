import { prisma } from "../config/database";
import { getPaginationParams, buildPaginationMeta } from "../utils/pagination";
import type { CreateOrderInput } from "../schemas/orders.schema";

const orderInclude = {
  address: true,
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, images: true, brand: true },
      },
      variant: {
        select: { id: true, size: true, color: true, colorHex: true },
      },
    },
  },
};

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  const { skip } = getPaginationParams({ page, limit });
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { orders, pagination: buildPaginationMeta(total, page, limit) };
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });
  if (!order) throw new Error("NOT_FOUND");
  return order;
}

export async function createOrder(userId: string, input: CreateOrderInput) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
      variant: true,
    },
  });

  if (cartItems.length === 0) throw new Error("EMPTY_CART");

  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId },
  });
  if (!address) throw new Error("ADDRESS_NOT_FOUND");

  let discount = 0;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode, isActive: true },
    });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      const subtotalForCoupon = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      if (!coupon.minOrderAmount || subtotalForCoupon >= Number(coupon.minOrderAmount)) {
        discount =
          coupon.discountType === "PERCENTAGE"
            ? (subtotalForCoupon * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue);
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shippingCost = subtotal > 999 ? 0 : 99;
  const tax = subtotal * 0.18;
  const total = subtotal - discount + shippingCost + tax;

  const order = await prisma.order.create({
    data: {
      userId,
      addressId: input.addressId,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      couponCode: input.couponCode,
      notes: input.notes,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.product.price,
          total: Number(item.product.price) * item.quantity,
        })),
      },
    },
    include: orderInclude,
  });

  // Decrement stock
  await Promise.all(
    cartItems.map((item) =>
      prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      })
    )
  );

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { userId } });

  return order;
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
  if (!order) throw new Error("NOT_FOUND");
  if (!["PENDING", "CONFIRMED"].includes(order.status)) {
    throw new Error("CANNOT_CANCEL");
  }
  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
    include: orderInclude,
  });
}

// Admin
export async function getAllOrders(page = 1, limit = 20, status?: string) {
  const { skip } = getPaginationParams({ page, limit });
  const where = status ? { status: status as never } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        ...orderInclude,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, pagination: buildPaginationMeta(total, page, limit) };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string
) {
  return prisma.order.update({
    where: { id: orderId },
    data: { status: status as never, ...(trackingNumber && { trackingNumber }) },
    include: orderInclude,
  });
}
