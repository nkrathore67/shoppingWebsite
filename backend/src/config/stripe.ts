import Stripe from "stripe";
import { env } from "./env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil",
    });
  }
  return _stripe;
}

// Keep named export for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
