import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Keep current pg SSL security behavior without deprecation warnings.
 */
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

/** Lazy proxy so importing this module during build does not open a DB pool. */
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
