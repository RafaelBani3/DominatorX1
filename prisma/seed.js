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

  // Seed Top Players
  const playersCount = await prisma.topPlayer.count();
  if (playersCount === 0) {
    await prisma.topPlayer.createMany({
      data: [
        {
          name: "Ronaldo Nazário",
          role: "ST",
          ovr: 97,
          playstyle: "Poacher",
          stats: JSON.stringify({ "PAC": 94, "SHO": 95, "PAS": 81, "DRI": 93 }),
        },
        {
          name: "Lionel Messi",
          role: "RW",
          ovr: 96,
          playstyle: "Playmaker",
          stats: JSON.stringify({ "PAC": 85, "SHO": 93, "PAS": 95, "DRI": 96 }),
        },
        {
          name: "Ruud Gullit",
          role: "CM",
          ovr: 97,
          playstyle: "Box to Box",
          stats: JSON.stringify({ "PAC": 90, "SHO": 91, "PAS": 92, "DEF": 88 }),
        }
      ]
    });
    console.log("Seeded 3 Top Players.");
  }

  // Seed Tactics
  const tacticsCount = await prisma.tactic.count();
  if (tacticsCount === 0) {
    await prisma.tactic.createMany({
      data: [
        {
          formation: "4-3-3 Holding",
          buildUp: JSON.stringify({ "Speed": 2, "Passing Distance": 1, "Mentality": "Balanced" }),
          offense: JSON.stringify({ "Passing Rate": 2, "Crossing Rate": 2, "Shooting Tendency": 2, "Positioning": "Organized" }),
          defense: JSON.stringify({ "Pressure": 2, "Width": 2, "Aggression": 2, "Backline": "Cover" }),
        },
        {
          formation: "4-2-3-1 Wide",
          buildUp: JSON.stringify({ "Speed": 3, "Passing Distance": 2, "Mentality": "Attacking" }),
          offense: JSON.stringify({ "Passing Rate": 3, "Crossing Rate": 3, "Shooting Tendency": 3, "Positioning": "Free Form" }),
          defense: JSON.stringify({ "Pressure": 3, "Width": 1, "Aggression": 3, "Backline": "Offside Trap" }),
        }
      ]
    });
    console.log("Seeded 2 Tactics.");
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
