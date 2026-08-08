"use server";

import { prisma } from "@/lib/prisma";

export async function getTactic(formation) {
  try {
    const tactic = await prisma.tactic.findUnique({
      where: { formation },
    });
    return tactic;
  } catch (error) {
    console.error("Failed to fetch tactic:", error);
    return null;
  }
}

export async function getAllFormations() {
  try {
    const tactics = await prisma.tactic.findMany({
      select: { formation: true },
      orderBy: { formation: "asc" }
    });
    return tactics.map(t => t.formation);
  } catch (error) {
    console.error("Failed to fetch formations:", error);
    return [];
  }
}
