"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { registerForTournament } from "@/lib/actions/tournaments";
import TournamentBracketView from "@/components/tournament/TournamentBracketView";
import Navbar from "@/components/landing/Navbar";
import Link from "next/link";

const STATUS_LABEL = {
  open: "Pendaftaran Dibuka",
  closed: "Pendaftaran Ditutup",
  match: "Sedang Berjalan",
  finished: "Selesai",
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
    <div className="min-h-screen text-white">
      <Navbar onJoin={() => (window.location.href = "/?join=1")} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-28 md:px-8">
        <Link
          href="/#tournaments"
          className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
        >
          ← Kembali ke daftar turnamen
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/45 p-6 backdrop-blur-md md:p-8">
          <p className="text-xs font-semibold tracking-wide text-emerald-300/90 uppercase">
            {STATUS_LABEL[tournament.status] || tournament.status}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-wide md:text-5xl">
            {tournament.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            {tournament.description ||
              "Turnamen internal Dominator XI. Single/Double elimination."}
          </p>
          <p className="mt-4 text-xs text-white/55">
            Peserta {tournament._count?.entries ?? tournament.entries?.length ?? 0}/
            {tournament.maxParticipants} ·{" "}
            <span className="capitalize">{tournament.bracketType}</span> elimination
          </p>
        </div>

        {tournament.status === "open" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-white/10 bg-white p-6 text-[#1F2430] shadow-xl"
            >
              <h2 className="text-xl font-bold">Daftar Turnamen</h2>
              <p className="mt-1 text-sm text-[#8A93A6]">
                Tanpa login — cukup nickname & nomor HP.
              </p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nickname FC Mobile</Label>
                  <Input
                    required
                    value={form.nickname}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nickname: e.target.value }))
                    }
                    className="h-11 rounded-2xl"
                    placeholder="Nickname in-game"
                  />
                </div>
                <div className="space-y-2">
                  <Label>No HP / WhatsApp</Label>
                  <Input
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                    }
                    className="h-11 rounded-2xl"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama (opsional)</Label>
                  <Input
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayName: e.target.value }))
                    }
                    className="h-11 rounded-2xl"
                    placeholder="Nama panggilan"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={pending}
                  className="h-12 w-full rounded-2xl bg-[#7C5CFC] font-semibold text-white hover:bg-[#6B4CEB]"
                >
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Kirim Pendaftaran
                </Button>
              </div>
            </form>

            <div className="rounded-3xl border border-white/10 bg-black/35 p-6">
              <h3 className="font-bold text-white">Peserta terdaftar</h3>
              <ul className="mt-4 max-h-[360px] space-y-2 overflow-y-auto">
                {(tournament.entries || []).map((e, i) => (
                  <li
                    key={e.id}
                    className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/85"
                  >
                    {i + 1}. {e.nickname}
                  </li>
                ))}
                {!tournament.entries?.length ? (
                  <li className="text-sm text-white/50">Belum ada peserta.</li>
                ) : null}
              </ul>
            </div>
          </div>
        ) : null}

        {tournament.status === "closed" ? (
          <div className="mt-8 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6 text-sm text-amber-100">
            Pendaftaran sudah ditutup. Bracket akan digenerate oleh admin.
          </div>
        ) : null}

        {["match", "finished"].includes(tournament.status) ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white p-5 text-[#1F2430] md:p-6">
            <h2 className="mb-4 text-xl font-bold">
              {tournament.status === "finished" ? "Bracket Final" : "Bracket Live"}
            </h2>
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
