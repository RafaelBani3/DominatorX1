"use server";

import { prisma } from "@/lib/prisma";

export async function getTopPlayers(role = null) {
  try {
    const where = role && role !== "All" ? { role } : {};
    const players = await prisma.topPlayer.findMany({
      where,
      orderBy: { ovr: "desc" },
    });
    return players;
  } catch (error) {
    console.error("Failed to fetch top players:", error);
    return [];
  }
}
