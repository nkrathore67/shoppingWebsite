import type { FastifyInstance, FastifyRequest } from "fastify";
import { getWishlist, addToWishlist, removeFromWishlist } from "../services/wishlist.service";
import { authenticate } from "../middleware/authenticate";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function wishlistRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (req) => getWishlist((req as AuthReq).user.userId));

  app.post("/", async (req, reply) => {
    const { productId } = req.body as { productId: string };
    try {
      return reply.status(201).send(await addToWishlist((req as AuthReq).user.userId, productId));
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
        return reply.status(404).send({ error: "Product not found" });
      }
      throw err;
    }
  });

  app.delete("/:productId", async (req, reply) => {
    const { productId } = req.params as { productId: string };
    try {
      await removeFromWishlist((req as AuthReq).user.userId, productId);
      return { message: "Removed from wishlist" };
    } catch {
      return reply.status(404).send({ error: "Not in wishlist" });
    }
  });
}
