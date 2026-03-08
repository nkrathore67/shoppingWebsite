import { FastifyInstance } from "fastify";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getMe,
} from "../services/auth.service";
import { registerSchema, loginSchema } from "../schemas/auth.schema";
import { authenticate } from "../middleware/authenticate";
import { env } from "../config/env";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (req, reply) => {
    const body = registerSchema.parse(req.body);
    try {
      const user = await registerUser(body);
      return reply.status(201).send({ message: "Account created", user });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EMAIL_TAKEN") {
        return reply.status(409).send({ error: "Email already in use" });
      }
      throw err;
    }
  });

  app.post("/login", async (req, reply) => {
    const body = loginSchema.parse(req.body);
    try {
      const { user, accessToken, refreshToken } = await loginUser(body);
      reply
        .setCookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 })
        .setCookie("refresh_token", refreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: 7 * 24 * 60 * 60,
        });
      return { user, accessToken };
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
        return reply.status(401).send({ error: "Invalid email or password" });
      }
      throw err;
    }
  });

  app.post("/logout", async (req, reply) => {
    const token = req.cookies?.["refresh_token"];
    if (token) await logoutUser(token);
    reply
      .clearCookie("access_token", { path: "/" })
      .clearCookie("refresh_token", { path: "/" });
    return { message: "Logged out" };
  });

  app.post("/refresh", async (req, reply) => {
    const token = req.cookies?.["refresh_token"];
    if (!token) return reply.status(401).send({ error: "No refresh token" });
    try {
      const { accessToken, refreshToken } = await refreshTokens(token);
      reply
        .setCookie("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 })
        .setCookie("refresh_token", refreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: 7 * 24 * 60 * 60,
        });
      return { accessToken };
    } catch {
      return reply.status(401).send({ error: "Invalid refresh token" });
    }
  });

  app.get("/me", { preHandler: [authenticate] }, async (req, reply) => {
    const user = (req as FastifyRequest & { user: { userId: string } }).user;
    const data = await getMe(user.userId);
    if (!data) return reply.status(404).send({ error: "User not found" });
    return data;
  });
}

// Type import needed
import type { FastifyRequest } from "fastify";
