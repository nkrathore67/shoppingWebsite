import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/tokenUtils";

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const token =
    req.cookies?.["access_token"] ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return reply.status(401).send({ error: "Unauthorized", message: "No token provided" });
  }

  try {
    const payload = verifyAccessToken(token);
    (req as FastifyRequest & { user: typeof payload }).user = payload;
  } catch {
    return reply.status(401).send({ error: "Unauthorized", message: "Invalid or expired token" });
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  const user = (req as FastifyRequest & { user?: { role: string } }).user;
  if (!user || user.role !== "ADMIN") {
    return reply.status(403).send({ error: "Forbidden", message: "Admin access required" });
  }
}

export async function requireSeller(req: FastifyRequest, reply: FastifyReply) {
  const user = (req as FastifyRequest & { user?: { role: string } }).user;
  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    return reply.status(403).send({ error: "Forbidden", message: "Seller access required" });
  }
}
