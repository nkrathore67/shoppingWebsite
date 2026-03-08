import { buildApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/database";

async function main() {
  const app = buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`Server running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }

  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
