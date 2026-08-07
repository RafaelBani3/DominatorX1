import { defineConfig } from "@prisma/config";
import { config as loadEnv } from "dotenv";

loadEnv();

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    url: process.env.DATABASE_URL,
  },
});
