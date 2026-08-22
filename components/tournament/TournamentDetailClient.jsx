"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Trophy, Users, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registerForTournament } from "@/lib/actions/tournaments";
import TournamentBracketView from "@/components/tournament/TournamentBracketView";
import Navbar from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";

const STATUS_META = {
  open: {
    label: "Pendaftaran Dibuka",
    className: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  },
  closed: {
    label: "Pendaftaran Ditutup",
    className: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  },
  match: {
    label: "Sedang Berjalan",
    className: "bg-violet-500/20 text-violet-200 ring-violet-400/30",
  },
  finished: {
    label: "Selesai",
    className: "bg-sky-500/20 text-sky-200 ring-sky-400/30",
  },
};

export default function TournamentDetailClient({ tournament }) {
  const [form, setForm] = useState({
    nickname: "",
    phoneNumber: "",
    displayName: "",
  });
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const status = STATUS_META[tournament.status] || STATUS_META.closed;
  const entryCount =
    tournament._count?.entries ?? tournament.entries?.length ?? 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await registerForTournament({
        tournamentId: tournament.id,
        ...form,
      });
      if (!res.success) {
        toast({
          title: "Gagal daftar",
          description: res.error,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Berhasil!",
        description: "Kamu sudah terdaftar di turnamen ini.",
      });
      setForm({ nickname: "", phoneNumber: "", displayName: "" });
      router.refresh();
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(124,92,252,0.14),transparent_45%)]"
      />
      <Navbar onJoin={() => (window.location.href = "/?join=1")} />

      <main className="relative mx-auto max-w-6xl px-5 pb-20 pt-28 md:px-8">
        <Link
          href="/#tournaments"
          className="text-sm font-medium text-emerald-300/90 transition hover:text-emerald-200"
        >
          ← Kembali ke daftar turnamen
        </Link>

        <div className="relative mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0B1512]/85 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-3xl"
          />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide uppercase ring-1",
                  status.className
                )}
              >
                {status.label}
              </span>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl tracking-wide md:text-5xl">
                {tournament.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                {tournament.description ||
                  "Turnamen internal Dominator XI. Single/Double elimination."}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/25">
              <Trophy className="h-7 w-7 text-emerald-300" />
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 ring-1 ring-white/10">
              <Users className="h-3.5 w-3.5 text-emerald-300" />
              {entryCount}/{tournament.maxParticipants} peserta
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 capitalize ring-1 ring-white/10">
              <Swords className="h-3.5 w-3.5 text-violet-300" />
              {tournament.bracketType} elimination
            </span>
          </div>
        </div>

        {tournament.status === "open" ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-[1.75rem] border border-emerald-400/20 bg-[#0D1A14] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:p-7"
            >
              <h2 className="text-xl font-bold text-white">Daftar Turnamen</h2>
              <p className="mt-1 text-sm text-white/55">
                Tanpa login — cukup nickname & nomor HP.
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/75">Nickname FC Mobile</Label>
                  <Input
                    required
                    value={form.nickname}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nickname: e.target.value }))
                    }
                    className="h-11 rounded-2xl border-white/10 bg-[#07110D] text-white placeholder:text-white/35 focus-visible:ring-emerald-400/40"
                    placeholder="Nickname in-game"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/75">No HP / WhatsApp</Label>
                  <Input
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                    }
                    className="h-11 rounded-2xl border-white/10 bg-[#07110D] text-white placeholder:text-white/35 focus-visible:ring-emerald-400/40"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/75">Nama (opsional)</Label>
                  <Input
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="h-11 rounded-2xl border-white/10 bg-[#07110D] text-white placeholder:text-white/35 focus-visible:ring-emerald-400/40"
                    placeholder="Nama panggilan"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-12 w-full rounded-2xl bg-emerald-400 font-semibold text-[#062012] hover:bg-emerald-300"
                >
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Kirim Pendaftaran
                </Button>
              </div>
            </form>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#0B1512]/80 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white">Peserta terdaftar</h3>
              <ul className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {(tournament.entries || []).map((e, i) => (
                  <li
                    key={e.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/85"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
                      {i + 1}
                    </span>
                    {e.nickname}
                  </li>
                ))}
                {!tournament.entries?.length ? (
                  <li className="py-8 text-center text-sm text-white/45">
                    Belum ada peserta. Jadilah yang pertama!
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}

        {tournament.status === "closed" ? (
          <div className="mt-8 rounded-[1.75rem] border border-amber-400/25 bg-amber-500/10 p-6 text-sm text-amber-100">
            Pendaftaran sudah ditutup. Bracket akan digenerate oleh admin.
          </div>
        ) : null}

        {["match", "finished"].includes(tournament.status) ? (
          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B1218]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)] md:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">
                {tournament.status === "finished"
                  ? "Bracket Final"
                  : "Bracket Live"}
              </h2>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                {tournament.status === "finished" ? "Finished" : "Live"}
              </span>
            </div>
            <TournamentBracketView
              matches={tournament.matches || []}
              bracketType={tournament.bracketType}
              interactive={false}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
