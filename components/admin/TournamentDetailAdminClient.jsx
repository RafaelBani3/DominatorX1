"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Trash2,
  RotateCcw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TournamentBracketView from "@/components/tournament/TournamentBracketView";
import {
  advanceTournamentStatus,
  deleteTournamentEntry,
  generateTournamentBracket,
  resetTournamentBracket,
  setMatchWinner,
} from "@/lib/actions/admin-tournaments";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  draft: "bg-slate-100 text-slate-600",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-amber-100 text-amber-700",
  match: "bg-violet-100 text-violet-700",
  finished: "bg-sky-100 text-sky-700",
};

const NEXT_LABEL = {
  draft: "Buka Pendaftaran (open)",
  open: "Tutup Pendaftaran (closed)",
  closed: null,
  match: "Tandai Finished",
  finished: null,
};

export default function TournamentDetailAdminClient({ tournament: initial }) {
  const [tournament, setTournament] = useState(initial);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setTournament(initial);
  }, [initial]);

  const refresh = () => router.refresh();

  const run = (fn, okMsg) => {
    startTransition(async () => {
      const res = await fn();
      if (!res?.success) {
        toast({
          title: "Gagal",
          description: res?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
        return;
      }
      if (okMsg) toast({ title: "Berhasil", description: okMsg });
      refresh();
    });
  };

  const nextLabel = NEXT_LABEL[tournament.status];

  return (
    <div className="space-y-6">
      <div className="rounded-[1.75rem] border border-white bg-white p-6 shadow-[0_12px_40px_rgba(124,92,252,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                STATUS_STYLE[tournament.status]
              )}
            >
              {tournament.status}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-[#1F2430]">
              {tournament.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[#8A93A6]">
              {tournament.description || "Tanpa deskripsi"} ·{" "}
              <span className="capitalize">{tournament.bracketType}</span> elimination ·
              max {tournament.maxParticipants} peserta
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {nextLabel ? (
              <Button
                disabled={pending}
                className="h-10 rounded-2xl bg-[#7C5CFC] text-white hover:bg-[#6B4CEB]"
                onClick={() =>
                  run(
                    () => advanceTournamentStatus(tournament.id),
                    `Status → ${tournament.status === "draft" ? "open" : tournament.status === "open" ? "closed" : "finished"}`
                  )
                }
              >
                {nextLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}

            {tournament.status === "closed" ? (
              <Button
                disabled={pending}
                className="h-10 rounded-2xl bg-violet-600 text-white hover:bg-violet-700"
                onClick={() =>
                  run(
                    () => generateTournamentBracket(tournament.id),
                    "Bracket digenerate · status match"
                  )
                }
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Bracket
              </Button>
            ) : null}

            {["match", "closed"].includes(tournament.status) &&
            (tournament.matches?.length || 0) > 0 ? (
              <Button
                variant="outline"
                disabled={pending}
                className="h-10 rounded-2xl"
                onClick={() => {
                  if (!confirm("Reset bracket? Status kembali ke closed.")) return;
                  run(() => resetTournamentBracket(tournament.id), "Bracket di-reset");
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Bracket
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(124,92,252,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#7C5CFC]" />
            <h2 className="font-bold text-[#1F2430]">
              Peserta ({tournament.entries?.length || 0})
            </h2>
          </div>
          <div className="max-h-[480px] space-y-2 overflow-y-auto">
            {(tournament.entries || []).map((e, idx) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1F2430]">
                    {idx + 1}. {e.nickname}
                  </p>
                  <p className="truncate text-xs text-[#8A93A6]">{e.phoneNumber}</p>
                </div>
                {["draft", "open", "closed"].includes(tournament.status) ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-rose-500"
                    disabled={pending}
                    onClick={() =>
                      run(
                        () => deleteTournamentEntry(e.id),
                        "Peserta dihapus"
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            ))}
            {!tournament.entries?.length ? (
              <p className="py-8 text-center text-sm text-[#8A93A6]">
                Belum ada peserta.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(124,92,252,0.08)]">
          <h2 className="mb-4 font-bold text-[#1F2430]">Bracket</h2>
          <TournamentBracketView
            matches={tournament.matches || []}
            bracketType={tournament.bracketType}
            interactive={tournament.status === "match"}
            pending={pending}
            onPickWinner={(matchId, winnerEntryId) =>
              run(
                () => setMatchWinner(matchId, winnerEntryId),
                "Pemenang disimpan"
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
