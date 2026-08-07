import { createRequire } from "node:module";
import path from "node:path";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Resolve from project root so this works in Next/Vercel bundles.
const require = createRequire(path.join(process.cwd(), "package.json"));

function loadPrismaClient() {
  try {
    return require("@prisma/client").PrismaClient;
  } catch (error) {
    throw new Error(
      "Prisma Client belum digenerate. Pastikan build menjalankan `prisma generate`. Detail: " +
        (error?.message || String(error))
    );
  }
}

function normalizeDatabaseUrl(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const sslmode = parsed.searchParams.get("sslmode");

    if (!sslmode || sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

const globalForPrisma = globalThis;

function createPrismaClient() {
  const PrismaClient = loadPrismaClient();
  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it in Vercel Project Settings → Environment Variables."
    );
  }

  const pool =
    globalForPrisma.__pgPool ??
    new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });

  globalForPrisma.__pgPool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrisma() {
  if (!globalForPrisma.__prisma) {
    globalForPrisma.__prisma = createPrismaClient();
  }
  return globalForPrisma.__prisma;
}

export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getPrisma();
      const value = client[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
