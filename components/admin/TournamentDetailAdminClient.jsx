"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Trash2,
  RotateCcw,
  Users,
  Trophy,
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
  draft: "bg-slate-500/20 text-slate-200 ring-slate-400/25",
  open: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  closed: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  match: "bg-violet-500/20 text-violet-200 ring-violet-400/30",
  finished: "bg-sky-500/20 text-sky-200 ring-sky-400/30",
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
      <div className="relative overflow-hidden rounded-[1.75rem] border border-[#2A2448] bg-gradient-to-br from-[#1B1535] to-[#12101F] p-6 text-white shadow-[0_16px_40px_rgba(40,30,90,0.25)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#7C5CFC]/25 blur-3xl"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
                STATUS_STYLE[tournament.status]
              )}
            >
              {tournament.status}
            </span>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-white">
              <Trophy className="h-6 w-6 text-[#A78BFA]" />
              {tournament.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-white/55">
              {tournament.description || "Tanpa deskripsi"} ·{" "}
              <span className="capitalize">{tournament.bracketType}</span>{" "}
              elimination · max {tournament.maxParticipants} peserta
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
                    `Status → ${
                      tournament.status === "draft"
                        ? "open"
                        : tournament.status === "open"
                          ? "closed"
                          : "finished"
                    }`
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
                className="h-10 rounded-2xl bg-emerald-500 text-[#062012] hover:bg-emerald-400"
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
                className="h-10 rounded-2xl border-white/15 bg-transparent text-white/75 hover:bg-white/5 hover:text-white"
                onClick={() => {
                  if (!confirm("Reset bracket? Status kembali ke closed.")) return;
                  run(
                    () => resetTournamentBracket(tournament.id),
                    "Bracket di-reset"
                  );
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
        <div className="rounded-[1.75rem] border border-[#2A2448] bg-gradient-to-b from-[#1B1535] to-[#12101F] p-5 text-white shadow-[0_16px_40px_rgba(40,30,90,0.2)]">
          <div className="mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#A78BFA]" />
            <h2 className="font-bold text-white">
              Peserta ({tournament.entries?.length || 0})
            </h2>
          </div>
          <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
            {(tournament.entries || []).map((e, idx) => (
              <div
                key={e.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {idx + 1}. {e.nickname}
                  </p>
                  <p className="truncate text-xs text-white/45">{e.phoneNumber}</p>
                </div>
                {["draft", "open", "closed"].includes(tournament.status) ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
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
              <p className="py-8 text-center text-sm text-white/40">
                Belum ada peserta.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#1F2A38] bg-gradient-to-br from-[#0F1720] to-[#0B1218] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-white">Bracket</h2>
            {tournament.status === "match" ? (
              <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                Klik pemenang untuk advance
              </span>
            ) : null}
          </div>
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
