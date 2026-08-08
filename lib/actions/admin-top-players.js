"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTopPlayer(data) {
  try {
    await prisma.topPlayer.create({
      data: {
        name: data.name,
        role: data.role,
        image: data.image,
        stats: data.stats,
        playstyle: data.playstyle,
        ovr: data.ovr,
        skillMoves: data.skillMoves,
        weakFoot: data.weakFoot,
      },
    });
    revalidatePath("/admin/top-players");
    revalidatePath("/top-players");
    return { success: true };
  } catch (error) {
    console.error("Failed to create player:", error);
    return { success: false, error: "Gagal menyimpan pemain" };
  }
}

export async function deleteTopPlayer(id) {
  try {
    await prisma.topPlayer.delete({
      where: { id },
    });
    revalidatePath("/admin/top-players");
    revalidatePath("/top-players");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete player:", error);
    return { success: false, error: "Gagal menghapus pemain" };
  }
}
