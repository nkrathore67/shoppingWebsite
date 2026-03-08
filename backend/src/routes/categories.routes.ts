import { FastifyInstance } from "fastify";
import {
  getAllCategories,
  getCategoriesByGender,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories.service";
import { authenticate, requireAdmin } from "../middleware/authenticate";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/", async (req) => {
    const { gender } = req.query as { gender?: string };
    return getAllCategories(gender);
  });

  app.get("/:gender", async (req, reply) => {
    const { gender } = req.params as { gender: string };
    const data = await getCategoriesByGender(gender);
    if (!data) return reply.status(404).send({ error: "Not found" });
    return data;
  });

  app.get("/:gender/:slug", async (req, reply) => {
    const { gender, slug } = req.params as { gender: string; slug: string };
    const category = await getCategoryBySlug(gender, slug);
    if (!category) return reply.status(404).send({ error: "Category not found" });
    return category;
  });
}

export async function adminCategoryRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireAdmin);

  app.post("/", async (req, reply) => {
    const body = req.body as Parameters<typeof createCategory>[0];
    const category = await createCategory(body);
    return reply.status(201).send(category);
  });

  app.patch("/:id", async (req) => {
    const { id } = req.params as { id: string };
    return updateCategory(id, req.body as Parameters<typeof updateCategory>[1]);
  });

  app.delete("/:id", async (req) => {
    const { id } = req.params as { id: string };
    return deleteCategory(id);
  });
}
