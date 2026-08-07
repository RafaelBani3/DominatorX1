import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

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
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dominator.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Super Admin";

async function main() {
  console.log("Seeding data...");

  await prisma.setting.upsert({
    where: { key: "community_name" },
    update: {},
    create: { key: "community_name", value: "Dominator XI" },
  });

  await prisma.setting.upsert({
    where: { key: "whatsapp_link" },
    update: {},
    create: {
      key: "whatsapp_link",
      value: "https://chat.whatsapp.com/FkZf7UL7HQ0E768p3eB2DM",
    },
  });

  const existing = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: "superadmin",
        permissions: JSON.stringify(["all"]),
        name: ADMIN_NAME,
      },
    });
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    console.log(`Password (default if never changed): ${ADMIN_PASSWORD}`);
  } else {
    const res = await auth.api.signUpEmail({
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        name: ADMIN_NAME,
      },
    });

    if (!res?.user) {
      throw new Error("Failed to create admin user via Better Auth");
    }

    await prisma.user.update({
      where: { id: res.user.id },
      data: {
        role: "superadmin",
        permissions: JSON.stringify(["all"]),
      },
    });

    console.log("Admin user created:");
    console.log(`  Email    : ${ADMIN_EMAIL}`);
    console.log(`  Password : ${ADMIN_PASSWORD}`);
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
    process.exit(1);
  });
