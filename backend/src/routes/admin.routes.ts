import type { FastifyInstance } from "fastify";
import { getAdminStats } from "../services/admin.service";
import { authenticate, requireAdmin } from "../middleware/authenticate";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireAdmin);

  app.get("/stats", async () => getAdminStats());
}
