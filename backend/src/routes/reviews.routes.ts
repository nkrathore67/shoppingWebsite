import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../services/reviews.service";
import { createReviewSchema, updateReviewSchema } from "../schemas/reviews.schema";
import { authenticate } from "../middleware/authenticate";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function reviewRoutes(app: FastifyInstance) {
  app.get("/products/:productId/reviews", async (req) => {
    const { productId } = req.params as { productId: string };
    const { page, limit, rating } = req.query as {
      page?: number;
      limit?: number;
      rating?: number;
    };
    return getProductReviews(productId, page, limit, rating);
  });

  app.post("/products/:productId/reviews", { preHandler: [authenticate] }, async (req, reply) => {
    const { productId } = req.params as { productId: string };
    const body = createReviewSchema.parse(req.body);
    try {
      const review = await createReview((req as AuthReq).user.userId, productId, body);
      return reply.status(201).send(review);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "PRODUCT_NOT_FOUND") {
        return reply.status(404).send({ error: "Product not found" });
      }
      throw err;
    }
  });

  app.patch("/reviews/:id", { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateReviewSchema.parse(req.body);
    try {
      return await updateReview((req as AuthReq).user.userId, id, body);
    } catch {
      return reply.status(404).send({ error: "Review not found" });
    }
  });

  app.delete("/reviews/:id", { preHandler: [authenticate] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await deleteReview((req as AuthReq).user.userId, id);
      return { message: "Review deleted" };
    } catch {
      return reply.status(404).send({ error: "Review not found" });
    }
  });
}
