"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllTacticsAdmin() {
  try {
    return await prisma.tactic.findMany({ orderBy: { formation: "asc" } });
  } catch (error) {
    return [];
  }
}

export async function createTactic(data) {
  try {
    await prisma.tactic.create({
      data: {
        formation: data.formation,
        buildUp: data.buildUp,
        offense: data.offense,
        defense: data.defense,
      },
    });
    revalidatePath("/admin/tactics");
    revalidatePath("/manager-tactics");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan taktik (mungkin formasi sudah ada)" };
  }
}

export async function deleteTactic(id) {
  try {
    await prisma.tactic.delete({
      where: { id },
    });
    revalidatePath("/admin/tactics");
    revalidatePath("/manager-tactics");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus taktik" };
  }
}
