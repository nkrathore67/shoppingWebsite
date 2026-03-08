import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  getUserOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../services/orders.service";
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/orders.schema";
import { authenticate, requireAdmin } from "../middleware/authenticate";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function orderRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.get("/", async (req) => {
    const { page, limit } = req.query as { page?: number; limit?: number };
    return getUserOrders((req as AuthReq).user.userId, page, limit);
  });

  app.post("/", async (req, reply) => {
    const body = createOrderSchema.parse(req.body);
    try {
      const order = await createOrder((req as AuthReq).user.userId, body);
      return reply.status(201).send(order);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msgMap: Record<string, number> = {
          EMPTY_CART: 400,
          ADDRESS_NOT_FOUND: 404,
        };
        const status = msgMap[err.message];
        if (status) return reply.status(status).send({ error: err.message });
      }
      throw err;
    }
  });

  app.get("/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await getOrderById((req as AuthReq).user.userId, id);
    } catch {
      return reply.status(404).send({ error: "Order not found" });
    }
  });

  app.patch("/:id/cancel", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await cancelOrder((req as AuthReq).user.userId, id);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "CANNOT_CANCEL") {
        return reply.status(400).send({ error: "Order cannot be cancelled" });
      }
      return reply.status(404).send({ error: "Order not found" });
    }
  });
}

export async function adminOrderRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireAdmin);

  app.get("/", async (req) => {
    const { page, limit, status } = req.query as {
      page?: number;
      limit?: number;
      status?: string;
    };
    return getAllOrders(page, limit, status);
  });

  app.patch("/:id/status", async (req) => {
    const { id } = req.params as { id: string };
    const { status, trackingNumber } = updateOrderStatusSchema.parse(req.body);
    return updateOrderStatus(id, status, trackingNumber);
  });
}
