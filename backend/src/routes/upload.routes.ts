import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/upload — upload an image file, returns its public URL
  app.post("/upload", { preHandler: authenticate }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: "No file provided" });

    const ext = path.extname(data.filename).toLowerCase() || ".jpg";
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    if (!allowed.includes(ext)) {
      return reply.status(400).send({ error: "Only image files are allowed" });
    }

    const filename = `${crypto.randomUUID()}${ext}`;
    const dest = path.join(UPLOADS_DIR, filename);

    await pipeline(data.file, fs.createWriteStream(dest));

    const baseUrl = process.env.BACKEND_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
    return { url: `${baseUrl}/uploads/${filename}` };
  });
}
