import type { FastifyInstance } from "fastify";
import { searchProducts, getSearchSuggestions } from "../services/search.service";

export async function searchRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const { q, gender, category, page, limit } = req.query as {
      q?: string;
      gender?: string;
      category?: string;
      page?: number;
      limit?: number;
    };
    if (!q || q.trim().length < 1) {
      return reply.status(400).send({ error: "Query parameter 'q' is required" });
    }
    return searchProducts({ q: q.trim(), gender, category, page, limit });
  });

  app.get("/suggestions", async (req, reply) => {
    const { q } = req.query as { q?: string };
    if (!q || q.trim().length < 1) {
      return reply.status(400).send({ error: "Query parameter 'q' is required" });
    }
    return getSearchSuggestions(q.trim());
  });
}
