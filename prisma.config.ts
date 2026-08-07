import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv();

// Fallback keeps `prisma generate` working on Vercel even if DATABASE_URL
// is only available at runtime for some environments.
const datasourceUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
