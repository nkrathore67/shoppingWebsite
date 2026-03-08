import type { FastifyInstance, FastifyRequest } from "fastify";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../services/cart.service";
import { addToCartSchema, updateCartItemSchema } from "../schemas/cart.schema";
import { authenticate } from "../middleware/authenticate";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function cartRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (req) => getCart((req as AuthReq).user.userId));

  app.post("/", async (req, reply) => {
    const body = addToCartSchema.parse(req.body);
    try {
      const item = await addToCart((req as AuthReq).user.userId, body);
      return reply.status(201).send(item);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
        return reply.status(400).send({ error: "Insufficient stock" });
      }
      if (err instanceof Error && err.message === "VARIANT_NOT_FOUND") {
        return reply.status(404).send({ error: "Variant not found" });
      }
      throw err;
    }
  });

  app.patch("/:itemId", async (req, reply) => {
    const { itemId } = req.params as { itemId: string };
    const body = updateCartItemSchema.parse(req.body);
    try {
      return await updateCartItem((req as AuthReq).user.userId, itemId, body);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "NOT_FOUND") {
        return reply.status(404).send({ error: "Cart item not found" });
      }
      if (err instanceof Error && err.message === "INSUFFICIENT_STOCK") {
        return reply.status(400).send({ error: "Insufficient stock" });
      }
      throw err;
    }
  });

  app.delete("/", async (req) => {
    await clearCart((req as AuthReq).user.userId);
    return { message: "Cart cleared" };
  });

  app.delete("/:itemId", async (req, reply) => {
    const { itemId } = req.params as { itemId: string };
    try {
      await removeFromCart((req as AuthReq).user.userId, itemId);
      return { message: "Item removed" };
    } catch {
      return reply.status(404).send({ error: "Cart item not found" });
    }
  });
}
