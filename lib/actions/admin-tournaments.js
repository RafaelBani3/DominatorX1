"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";
import { tournamentCreateSchema } from "@/lib/validations/tournament";
import {
  buildDoubleElimination,
  buildSingleElimination,
  computeAdvance,
  isTournamentComplete,
} from "@/lib/tournament/bracket";

const STATUS_FLOW = ["draft", "open", "closed", "match", "finished"];

function revalidateTournament(id) {
  revalidatePath("/");
  revalidatePath("/admin/tournaments");
  if (id) {
    revalidatePath(`/admin/tournaments/${id}`);
    revalidatePath(`/tournament/${id}`);
  }
}

export async function adminListTournaments() {
  await assertAdminSession();
  return prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { entries: true, matches: true } },
    },
  });
}

export async function adminGetTournament(id) {
  await assertAdminSession();
  return prisma.tournament.findUnique({
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
    },
  });
}

export async function createTournament(raw) {
  try {
    await assertAdminSession();
    const data = tournamentCreateSchema.parse(raw);
    const tournament = await prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description || null,
        bracketType: data.bracketType,
        maxParticipants: data.maxParticipants,
        status: "draft",
      },
    });
    revalidateTournament(tournament.id);
    return { success: true, tournament };
  } catch (error) {
    return { success: false, error: error.message || "Gagal membuat turnamen" };
  }
}

export async function updateTournament(id, raw) {
  try {
    await assertAdminSession();
    const data = tournamentCreateSchema.partial().parse(raw);
    await prisma.tournament.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined
          ? { description: data.description || null }
          : {}),
        ...(data.bracketType !== undefined
          ? { bracketType: data.bracketType }
          : {}),
        ...(data.maxParticipants !== undefined
          ? { maxParticipants: data.maxParticipants }
          : {}),
      },
    });
    revalidateTournament(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal update turnamen" };
  }
}

export async function advanceTournamentStatus(id) {
  try {
    await assertAdminSession();
    const t = await prisma.tournament.findUnique({ where: { id } });
    if (!t) return { success: false, error: "Turnamen tidak ditemukan" };

    const idx = STATUS_FLOW.indexOf(t.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) {
      return { success: false, error: "Status tidak bisa dimajukan" };
    }

    const next = STATUS_FLOW[idx + 1];

    // Guards
    if (next === "match") {
      return {
        success: false,
        error: "Gunakan Generate Bracket untuk masuk status match",
      };
    }
    if (next === "closed") {
      const count = await prisma.tournamentEntry.count({
        where: { tournamentId: id },
      });
      if (count < 2) {
        return { success: false, error: "Minimal 2 peserta sebelum menutup pendaftaran" };
      }
    }
    if (next === "finished") {
      const matches = await prisma.tournamentMatch.findMany({
        where: { tournamentId: id },
      });
      if (!isTournamentComplete(matches)) {
        return {
          success: false,
          error: "Masih ada match yang belum selesai",
        };
      }
    }

    await prisma.tournament.update({
      where: { id },
      data: { status: next },
    });
    revalidateTournament(id);
    return { success: true, status: next };
  } catch (error) {
    return { success: false, error: error.message || "Gagal ubah status" };
  }
}

export async function setTournamentStatus(id, status) {
  try {
    await assertAdminSession();
    if (!STATUS_FLOW.includes(status)) {
      return { success: false, error: "Status tidak valid" };
    }
    await prisma.tournament.update({
      where: { id },
      data: { status },
    });
    revalidateTournament(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal set status" };
  }
}

export async function deleteTournamentEntry(entryId) {
  try {
    await assertAdminSession();
    const entry = await prisma.tournamentEntry.findUnique({
      where: { id: entryId },
      include: { tournament: true },
    });
    if (!entry) return { success: false, error: "Peserta tidak ditemukan" };
    if (!["draft", "open", "closed"].includes(entry.tournament.status)) {
      return {
        success: false,
        error: "Peserta hanya bisa dihapus sebelum bracket digenerate",
      };
    }
    await prisma.tournamentEntry.delete({ where: { id: entryId } });
    revalidateTournament(entry.tournamentId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal hapus peserta" };
  }
}

export async function generateTournamentBracket(id) {
  try {
    await assertAdminSession();
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: { entries: true, matches: true },
    });
    if (!tournament) return { success: false, error: "Turnamen tidak ditemukan" };
    if (tournament.status !== "closed") {
      return {
        success: false,
        error: "Tutup pendaftaran dulu (status closed) sebelum generate",
      };
    }
    if (tournament.entries.length < 2) {
      return { success: false, error: "Minimal 2 peserta" };
    }

    const built =
      tournament.bracketType === "double"
        ? buildDoubleElimination(tournament.entries)
        : buildSingleElimination(tournament.entries);

    await prisma.$transaction(async (tx) => {
      await tx.tournamentMatch.deleteMany({ where: { tournamentId: id } });

      const keyToId = {};
      // Create matches without relations first
      for (const m of built.matches) {
        const created = await tx.tournamentMatch.create({
          data: {
            tournamentId: id,
            round: m.round,
            bracketSide: m.bracketSide,
            matchIndex: m.matchIndex,
            player1EntryId: m.player1EntryId,
            player2EntryId: m.player2EntryId,
            winnerEntryId: m.winnerEntryId,
            status: m.status,
          },
        });
        keyToId[m.tempKey] = created.id;
      }

      // Wire next / loser next
      for (const m of built.matches) {
        const data = {};
        if (m.nextMatchKey && keyToId[m.nextMatchKey]) {
          data.nextMatchId = keyToId[m.nextMatchKey];
          data.nextSlot = m.nextSlot;
        }
        if (m.loserNextMatchKey && keyToId[m.loserNextMatchKey]) {
          data.loserNextMatchId = keyToId[m.loserNextMatchKey];
          data.loserNextSlot = m.loserNextSlot;
        }
        if (Object.keys(data).length) {
          await tx.tournamentMatch.update({
            where: { id: keyToId[m.tempKey] },
            data,
          });
        }
      }

      // Persist auto-advanced bye winners into next slots (already in blueprint)
      for (const m of built.matches) {
        if (!m.winnerEntryId || !m.nextMatchKey) continue;
        const nextId = keyToId[m.nextMatchKey];
        if (!nextId) continue;
        const slot =
          m.nextSlot === 2 ? { player2EntryId: m.winnerEntryId } : { player1EntryId: m.winnerEntryId };
        const next = await tx.tournamentMatch.findUnique({ where: { id: nextId } });
        const patch = {};
        if (m.nextSlot === 2 && !next.player2EntryId) patch.player2EntryId = m.winnerEntryId;
        if (m.nextSlot !== 2 && !next.player1EntryId) patch.player1EntryId = m.winnerEntryId;
        if (Object.keys(patch).length) {
          const updated = { ...next, ...patch };
          if (updated.player1EntryId && updated.player2EntryId && updated.status !== "done") {
            patch.status = "ready";
          }
          await tx.tournamentMatch.update({ where: { id: nextId }, data: patch });
        }
      }

      await tx.tournament.update({
        where: { id },
        data: { status: "match" },
      });
    });

    revalidateTournament(id);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error.message || "Gagal generate bracket" };
  }
}

export async function setMatchWinner(matchId, winnerEntryId) {
  try {
    await assertAdminSession();
    const match = await prisma.tournamentMatch.findUnique({
      where: { id: matchId },
      include: { tournament: true },
    });
    if (!match) return { success: false, error: "Match tidak ditemukan" };
    if (match.tournament.status !== "match") {
      return { success: false, error: "Turnamen tidak dalam status match" };
    }

    const allMatches = await prisma.tournamentMatch.findMany({
      where: { tournamentId: match.tournamentId },
    });
    const byId = Object.fromEntries(allMatches.map((m) => [m.id, { ...m }]));

    const { updates } = computeAdvance(byId, matchId, winnerEntryId);

    await prisma.$transaction(
      updates.map((m) =>
        prisma.tournamentMatch.update({
          where: { id: m.id },
          data: {
            player1EntryId: m.player1EntryId,
            player2EntryId: m.player2EntryId,
            winnerEntryId: m.winnerEntryId,
            status: m.status,
          },
        })
      )
    );

    const refreshed = await prisma.tournamentMatch.findMany({
      where: { tournamentId: match.tournamentId },
    });
    if (isTournamentComplete(refreshed)) {
      await prisma.tournament.update({
        where: { id: match.tournamentId },
        data: { status: "finished" },
      });
    }

    revalidateTournament(match.tournamentId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal set pemenang" };
  }
}

export async function resetTournamentBracket(id) {
  try {
    await assertAdminSession();
    const t = await prisma.tournament.findUnique({ where: { id } });
    if (!t) return { success: false, error: "Turnamen tidak ditemukan" };
    if (t.status === "finished") {
      return { success: false, error: "Turnamen finished tidak bisa di-reset tanpa ubah status manual" };
    }

    await prisma.$transaction([
      prisma.tournamentMatch.deleteMany({ where: { tournamentId: id } }),
      prisma.tournament.update({
        where: { id },
        data: { status: "closed" },
      }),
    ]);

    revalidateTournament(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal reset bracket" };
  }
}

export async function deleteTournament(id) {
  try {
    await assertAdminSession();
    await prisma.tournament.delete({ where: { id } });
    revalidateTournament(null);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message || "Gagal hapus turnamen" };
  }
}
