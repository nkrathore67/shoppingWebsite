import "dotenv/config";
import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import { env } from "./config/env";

// Routes
import { authRoutes } from "./routes/auth.routes";
import { productRoutes, adminProductRoutes } from "./routes/products.routes";
import { categoryRoutes, adminCategoryRoutes } from "./routes/categories.routes";
import { cartRoutes } from "./routes/cart.routes";
import { wishlistRoutes } from "./routes/wishlist.routes";
import { orderRoutes, adminOrderRoutes } from "./routes/orders.routes";
import { reviewRoutes } from "./routes/reviews.routes";
import { searchRoutes } from "./routes/search.routes";
import { userRoutes, adminUserRoutes } from "./routes/users.routes";
import { paymentRoutes } from "./routes/payment.routes";
import { adminRoutes } from "./routes/admin.routes";
import { sellerRoutes } from "./routes/seller.routes";
import { uploadRoutes } from "./routes/upload.routes";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      ...(env.NODE_ENV !== "production" && {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
    },
  });

  // Plugins
  app.register(fastifyCors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.register(fastifyCookie);

  app.register(fastifyMultipart, { limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

  app.register(fastifyStatic, {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
  });

  app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // Health check
  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  }));

  // Register routes under /api prefix
  app.register(authRoutes, { prefix: "/api/auth" });
  app.register(userRoutes, { prefix: "/api/users" });
  app.register(productRoutes, { prefix: "/api/products" });
  app.register(categoryRoutes, { prefix: "/api/categories" });
  app.register(cartRoutes, { prefix: "/api/cart" });
  app.register(wishlistRoutes, { prefix: "/api/wishlist" });
  app.register(orderRoutes, { prefix: "/api/orders" });
  app.register(reviewRoutes, { prefix: "/api" });
  app.register(searchRoutes, { prefix: "/api/search" });
  app.register(paymentRoutes, { prefix: "/api/payments" });

  // Upload route
  app.register(uploadRoutes, { prefix: "/api" });

  // Seller routes
  app.register(sellerRoutes, { prefix: "/api/seller" });

  // Admin routes
  app.register(adminRoutes, { prefix: "/api/admin" });
  app.register(adminProductRoutes, { prefix: "/api/admin/products" });
  app.register(adminCategoryRoutes, { prefix: "/api/admin/categories" });
  app.register(adminOrderRoutes, { prefix: "/api/admin/orders" });
  app.register(adminUserRoutes, { prefix: "/api/admin/users" });

  // Global error handler
  app.setErrorHandler((error, req, reply) => {
    app.log.error(error);

    if (error.name === "ZodError") {
      return reply.status(400).send({
        error: "Validation Error",
        issues: JSON.parse(error.message),
      });
    }

    const statusCode = error.statusCode ?? 500;
    return reply.status(statusCode).send({
      error: error.message || "Internal Server Error",
    });
  });

  return app;
}
