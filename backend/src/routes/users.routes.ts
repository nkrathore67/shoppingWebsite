import type { FastifyInstance, FastifyRequest } from "fastify";
import {
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  updateUserRole,
} from "../services/users.service";
import { updateProfileSchema, addressSchema } from "../schemas/users.schema";
import { changePasswordSchema } from "../schemas/auth.schema";
import { authenticate, requireAdmin } from "../middleware/authenticate";

type AuthReq = FastifyRequest & { user: { userId: string } };

export async function userRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);

  app.patch("/me", async (req) => {
    const body = updateProfileSchema.parse(req.body);
    return updateProfile((req as AuthReq).user.userId, body);
  });

  app.patch("/me/password", async (req, reply) => {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    try {
      await changePassword((req as AuthReq).user.userId, currentPassword, newPassword);
      return { message: "Password updated" };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INVALID_CURRENT_PASSWORD") {
        return reply.status(400).send({ error: "Current password is incorrect" });
      }
      throw err;
    }
  });

  app.get("/me/addresses", async (req) => getAddresses((req as AuthReq).user.userId));

  app.post("/me/addresses", async (req, reply) => {
    const body = addressSchema.parse(req.body);
    const address = await createAddress((req as AuthReq).user.userId, body);
    return reply.status(201).send(address);
  });

  app.patch("/me/addresses/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = addressSchema.partial().parse(req.body);
    try {
      return await updateAddress((req as AuthReq).user.userId, id, body);
    } catch {
      return reply.status(404).send({ error: "Address not found" });
    }
  });

  app.delete("/me/addresses/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await deleteAddress((req as AuthReq).user.userId, id);
      return { message: "Address deleted" };
    } catch {
      return reply.status(404).send({ error: "Address not found" });
    }
  });

  app.patch("/me/addresses/:id/default", async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      return await setDefaultAddress((req as AuthReq).user.userId, id);
    } catch {
      return reply.status(404).send({ error: "Address not found" });
    }
  });
}

export async function adminUserRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireAdmin);

  app.get("/", async (req) => {
    const { page, limit } = req.query as { page?: number; limit?: number };
    return getAllUsers(page, limit);
  });

  app.patch("/:id/role", async (req) => {
    const { id } = req.params as { id: string };
    const { role } = req.body as { role: "CUSTOMER" | "ADMIN" };
    return updateUserRole(id, role);
  });
}
