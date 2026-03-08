import { stripe } from "../config/stripe";
import { prisma } from "../config/database";
import Stripe from "stripe";

export async function createPaymentIntent(
  userId: string,
  addressId: string,
  couponCode?: string
) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true, variant: true },
  });

  if (cartItems.length === 0) throw new Error("EMPTY_CART");

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("ADDRESS_NOT_FOUND");

  let discount = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode, isActive: true },
    });
    if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
      const subtotalCheck = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
      if (!coupon.minOrderAmount || subtotalCheck >= Number(coupon.minOrderAmount)) {
        discount =
          coupon.discountType === "PERCENTAGE"
            ? (subtotalCheck * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue);
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

  const amountInPaise = Math.round(total * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInPaise,
    currency: "inr",
    metadata: { userId, addressId, couponCode: couponCode ?? "" },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    amount: total,
    breakdown: { subtotal, discount, shippingCost, tax, total },
  };
}

export async function handleStripeWebhook(
  payload: Buffer,
  signature: string,
  webhookSecret: string
) {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    throw new Error("INVALID_SIGNATURE");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { userId, addressId, couponCode } = paymentIntent.metadata;

    const existingOrder = await prisma.order.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });
    if (existingOrder) return; // Already processed (idempotency)

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, variant: true },
    });

    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        const subtotalCheck = cartItems.reduce(
          (sum, item) => sum + Number(item.product.price) * item.quantity,
          0
        );
        discount =
          coupon.discountType === "PERCENTAGE"
            ? (subtotalCheck * Number(coupon.discountValue)) / 100
            : Number(coupon.discountValue);
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    const shippingCost = subtotal > 999 ? 0 : 99;
    const tax = subtotal * 0.18;
    const total = subtotal - discount + shippingCost + tax;

    await prisma.order.create({
      data: {
        userId,
        addressId,
        paymentIntentId: paymentIntent.id,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        couponCode: couponCode || undefined,
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
    });

    await Promise.all([
      ...cartItems.map((item) =>
        prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        })
      ),
      prisma.cartItem.deleteMany({ where: { userId } }),
    ]);
  }
}

export async function validateCoupon(code: string, orderAmount: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code, isActive: true },
  });

  if (!coupon) throw new Error("INVALID_COUPON");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error("COUPON_EXPIRED");
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) throw new Error("COUPON_EXHAUSTED");
  if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
    throw new Error("MINIMUM_ORDER_REQUIRED");
  }

  const discountAmount =
    coupon.discountType === "PERCENTAGE"
      ? (orderAmount * Number(coupon.discountValue)) / 100
      : Number(coupon.discountValue);

  return { coupon, discountAmount };
}
