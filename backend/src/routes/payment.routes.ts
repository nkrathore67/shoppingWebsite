import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  createPaymentIntent,
  handleStripeWebhook,
  validateCoupon,
} from "../services/payment.service";
import { authenticate } from "../middleware/authenticate";
import { env } from "../config/env";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function paymentRoutes(app: FastifyInstance) {
  app.post("/create-intent", { preHandler: [authenticate] }, async (req, reply) => {
    const { addressId, couponCode } = req.body as {
      addressId: string;
      couponCode?: string;
    };
    try {
      const result = await createPaymentIntent(
        (req as AuthReq).user.userId,
        addressId,
        couponCode
      );
      return result;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMPTY_CART") {
        return reply.status(400).send({ error: "Cart is empty" });
      }
      if (err instanceof Error && err.message === "ADDRESS_NOT_FOUND") {
        return reply.status(404).send({ error: "Address not found" });
      }
      throw err;
    }
  });

  app.post("/webhook", {
    config: { rawBody: true },
  }, async (req, reply) => {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) return reply.status(400).send({ error: "Missing signature" });

    try {
      await handleStripeWebhook(
        req.rawBody as Buffer,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
      return { received: true };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INVALID_SIGNATURE") {
        return reply.status(400).send({ error: "Invalid webhook signature" });
      }
      throw err;
    }
  });

  app.post("/validate-coupon", { preHandler: [authenticate] }, async (req, reply) => {
    const { code, orderAmount } = req.body as { code: string; orderAmount: number };
    try {
      return await validateCoupon(code, orderAmount);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errMap: Record<string, string> = {
          INVALID_COUPON: "Invalid coupon code",
          COUPON_EXPIRED: "Coupon has expired",
          COUPON_EXHAUSTED: "Coupon usage limit reached",
          MINIMUM_ORDER_REQUIRED: "Minimum order amount not met",
        };
        return reply.status(400).send({ error: errMap[err.message] ?? err.message });
      }
      throw err;
    }
  });
}
