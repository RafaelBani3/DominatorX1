import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

dotenv.config();

const datasourceUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres?sslmode=disable";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: datasourceUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
