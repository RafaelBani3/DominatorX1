import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

const globalForAuth = globalThis;

function createAuth() {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [nextCookies()],
  });
}

export function getAuth() {
  if (!globalForAuth.__dominatorAuth) {
    globalForAuth.__dominatorAuth = createAuth();
  }
  return globalForAuth.__dominatorAuth;
}

/** Lazy proxy — avoids initializing Better Auth during Next build page-data collection. */
export const auth = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getAuth();
      const value = instance[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  }
);
