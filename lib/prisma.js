import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Silence pg-connection-string deprecation: prefer/require/verify-ca are currently
 * aliases for verify-full. Be explicit to keep today's security behavior.
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

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

const globalForPrisma = globalThis;

const pool =
  globalForPrisma.__pgPool ??
  new Pool({ connectionString });

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__pgPool = pool;
  globalForPrisma.__prisma = prisma;
}
