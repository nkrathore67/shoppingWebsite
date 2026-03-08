import { FastifyInstance } from "fastify";
import { authenticate, requireSeller } from "../middleware/authenticate";
import { createProduct, updateProduct, deleteProduct } from "../services/products.service";
import { createProductSchema, updateProductSchema } from "../schemas/products.schema";
import { prisma } from "../config/database";

type AuthenticatedUser = { id: string; role: string };

export async function sellerRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireSeller);

  // GET /api/seller/products — list own products (all, including inactive)
  app.get("/products", async (req) => {
    const seller = (req as typeof req & { user: AuthenticatedUser }).user;
    const where = seller.role === "ADMIN" ? {} : { sellerId: seller.id };
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { variants: { select: { id: true, size: true, color: true, stock: true } } },
    });
    return { products, total: products.length };
  });

  // GET /api/seller/stats — dashboard counts
  app.get("/stats", async (req) => {
    const seller = (req as typeof req & { user: AuthenticatedUser }).user;
    const where = seller.role === "ADMIN" ? {} : { sellerId: seller.id };

    const [total, active, totalStock] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.count({ where: { ...where, isActive: true } }),
      prisma.product.aggregate({ where, _sum: { totalStock: true } }),
    ]);

    return { total, active, totalStock: totalStock._sum.totalStock ?? 0 };
  });

  // POST /api/seller/products — create product
  app.post("/products", async (req, reply) => {
    const seller = (req as typeof req & { user: AuthenticatedUser }).user;
    const body = createProductSchema.parse(req.body);
    const product = await createProduct({ ...body, sellerId: seller.id });
    return reply.status(201).send(product);
  });

  // PATCH /api/seller/products/:id — update own product
  app.patch("/products/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const seller = (req as typeof req & { user: AuthenticatedUser }).user;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: "Product not found" });
    if (seller.role !== "ADMIN" && existing.sellerId !== seller.id) {
      return reply.status(403).send({ error: "Forbidden", message: "Not your product" });
    }

    const body = updateProductSchema.parse(req.body);
    return updateProduct(id, body);
  });

  // DELETE /api/seller/products/:id — soft-delete own product
  app.delete("/products/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const seller = (req as typeof req & { user: AuthenticatedUser }).user;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: "Product not found" });
    if (seller.role !== "ADMIN" && existing.sellerId !== seller.id) {
      return reply.status(403).send({ error: "Forbidden", message: "Not your product" });
    }

    return deleteProduct(id);
  });
}
