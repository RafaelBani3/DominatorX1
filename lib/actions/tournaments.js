"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { tournamentRegisterSchema } from "@/lib/validations/tournament";

export async function getPublicTournaments() {
  return prisma.tournament.findMany({
    where: { status: { in: ["open", "match", "finished"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { entries: true } },
    },
  });
}

export async function getPublicTournament(id) {
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      entries: { orderBy: { createdAt: "asc" } },
      matches: {
        orderBy: [{ bracketSide: "asc" }, { round: "asc" }, { matchIndex: "asc" }],
        include: {
          player1: true,
          player2: true,
          winner: true,
        },
      },
      _count: { select: { entries: true } },
    },
  });

  if (!tournament || tournament.status === "draft") return null;
  return tournament;
}

export async function registerForTournament(raw) {
  try {
    const data = tournamentRegisterSchema.parse(raw);
    const tournament = await prisma.tournament.findUnique({
      where: { id: data.tournamentId },
      include: { _count: { select: { entries: true } } },
    });

    if (!tournament) {
      return { success: false, error: "Turnamen tidak ditemukan" };
    }
    if (tournament.status !== "open") {
      return { success: false, error: "Pendaftaran sedang ditutup" };
    }
    if (tournament._count.entries >= tournament.maxParticipants) {
      return { success: false, error: "Kuota peserta sudah penuh" };
    }

    const nickname = data.nickname.trim();
    const phoneNumber = data.phoneNumber.trim();

    try {
      await prisma.tournamentEntry.create({
        data: {
          tournamentId: data.tournamentId,
          nickname,
          phoneNumber,
          displayName: data.displayName?.trim() || null,
        },
      });
    } catch (err) {
      if (err?.code === "P2002") {
        return {
          success: false,
          error: "Nickname atau nomor HP sudah terdaftar di turnamen ini",
        };
      }
      throw err;
    }

    revalidatePath("/");
    revalidatePath(`/tournament/${data.tournamentId}`);
    revalidatePath(`/admin/tournaments/${data.tournamentId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Gagal mendaftar turnamen",
    };
  }
}
