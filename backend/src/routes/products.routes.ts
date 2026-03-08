import { FastifyInstance } from "fastify";
import {
  getProducts,
  getProductById,
  getRelatedProducts,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from "../services/products.service";
import { productQuerySchema, createProductSchema, updateProductSchema } from "../schemas/products.schema";
import { authenticate, requireAdmin } from "../middleware/authenticate";

export async function productRoutes(app: FastifyInstance) {
  app.get("/", async (req) => {
    const query = productQuerySchema.parse(req.query);
    return getProducts(query);
  });

  app.get("/featured", async () => getFeaturedProducts());
  app.get("/new-arrivals", async () => getNewArrivals());
  app.get("/best-sellers", async () => getBestSellers());

  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const product = await getProductById(id);
    if (!product) return reply.status(404).send({ error: "Product not found" });
    return product;
  });

  app.get("/:id/related", async (req) => {
    const { id } = req.params as { id: string };
    return getRelatedProducts(id);
  });
}

export async function adminProductRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireAdmin);

  app.post("/", async (req, reply) => {
    const body = createProductSchema.parse(req.body);
    const product = await createProduct(body);
    return reply.status(201).send(product);
  });

  app.patch("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = updateProductSchema.parse(req.body);
    try {
      return await updateProduct(id, body);
    } catch {
      return reply.status(404).send({ error: "Product not found" });
    }
  });

  app.delete("/:id", async (req) => {
    const { id } = req.params as { id: string };
    return deleteProduct(id);
  });

  app.patch("/:id/toggle-active", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await toggleProductActive(id);
    } catch {
      return reply.status(404).send({ error: "Product not found" });
    }
  });
}
