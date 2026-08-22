"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Users, Trash2, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createTournament,
  deleteTournament,
} from "@/lib/actions/admin-tournaments";
import { cn } from "@/lib/utils";

const STATUS_STYLE = {
  draft: "bg-slate-500/20 text-slate-200 ring-slate-400/25",
  open: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  closed: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  match: "bg-violet-500/20 text-violet-200 ring-violet-400/30",
  finished: "bg-sky-500/20 text-sky-200 ring-sky-400/30",
};

export default function TournamentsAdminClient({ initialTournaments = [] }) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    bracketType: "single",
    maxParticipants: 16,
  });

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createTournament(form);
      if (!res.success) {
        toast({ title: "Gagal", description: res.error, variant: "destructive" });
        return;
      }
      toast({ title: "Berhasil", description: "Turnamen dibuat" });
      setOpen(false);
      setForm({
        name: "",
        description: "",
        bracketType: "single",
        maxParticipants: 16,
      });
      router.refresh();
      setTournaments((prev) => [
        { ...res.tournament, _count: { entries: 0, matches: 0 } },
        ...prev,
      ]);
    });
  };

  const handleDelete = (id) => {
    if (!confirm("Hapus turnamen ini beserta peserta & bracket?")) return;
    startTransition(async () => {
      const res = await deleteTournament(id);
      if (!res.success) {
        toast({ title: "Gagal", description: res.error, variant: "destructive" });
        return;
      }
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Dihapus", description: "Turnamen dihapus" });
      router.refresh();
    });
  };

  const sorted = useMemo(() => tournaments, [tournaments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#1B1535] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#C4B5FD] uppercase">
            <Swords className="h-3.5 w-3.5" />
            Arena
          </div>
          <h1 className="text-2xl font-bold text-[#1F2430]">Tournaments</h1>
          <p className="mt-1 text-sm text-[#7A8499]">
            Kelola turnamen internal, pendaftaran, dan bracket.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="h-11 rounded-2xl bg-[#7C5CFC] px-5 font-semibold text-white hover:bg-[#6B4CEB]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Buat Turnamen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((t) => (
          <div
            key={t.id}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[#2A2448] bg-gradient-to-br from-[#1B1535] to-[#12101F] p-5 text-white shadow-[0_16px_40px_rgba(40,30,90,0.25)]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7C5CFC]/20 blur-2xl transition group-hover:bg-emerald-400/20"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1",
                    STATUS_STYLE[t.status] || STATUS_STYLE.draft
                  )}
                >
                  {t.status}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/55">
                  {t.description || "Tanpa deskripsi"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                <Trophy className="h-5 w-5 text-[#A78BFA]" />
              </div>
            </div>

            <div className="relative mt-4 flex items-center gap-4 text-xs font-medium text-white/50">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-emerald-300/80" />
                {t._count?.entries ?? 0}/{t.maxParticipants}
              </span>
              <span className="capitalize">{t.bracketType} elim</span>
            </div>

            <div className="relative mt-5 flex gap-2">
              <Button
                asChild
                className="h-10 flex-1 rounded-2xl bg-[#7C5CFC] text-sm font-semibold text-white hover:bg-[#6B4CEB]"
              >
                <Link href={`/admin/tournaments/${t.id}`}>Kelola</Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-2xl border-rose-400/30 bg-transparent text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
                onClick={() => handleDelete(t.id)}
                disabled={pending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {sorted.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#2A2448] bg-[#1B1535]/70 p-10 text-center text-sm text-white/50 md:col-span-2 xl:col-span-3">
            Belum ada turnamen. Buat yang pertama.
          </div>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border border-[#2A2448] bg-[#15122A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Buat Turnamen</DialogTitle>
            <DialogDescription className="text-white/55">
              Single atau double elimination. Status awal: draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-white/75">Nama</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-11 rounded-2xl border-white/10 bg-[#0E0C1A] text-white placeholder:text-white/35"
                placeholder="Dominator Cup S1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/75">Deskripsi</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="h-11 rounded-2xl border-white/10 bg-[#0E0C1A] text-white placeholder:text-white/35"
                placeholder="Turnamen internal komunitas"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-white/75">Tipe Bracket</Label>
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-[#0E0C1A] p-1">
                  {[
                    { value: "single", label: "Single" },
                    { value: "double", label: "Double" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, bracketType: opt.value }))
                      }
                      className={cn(
                        "h-9 rounded-xl text-sm font-medium transition-colors",
                        form.bracketType === opt.value
                          ? "bg-[#7C5CFC] text-white"
                          : "text-white/55 hover:bg-white/5"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/75">Max Peserta</Label>
                <Input
                  type="number"
                  min={2}
                  max={128}
                  value={form.maxParticipants}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxParticipants: Number(e.target.value) || 16,
                    }))
                  }
                  className="h-11 rounded-2xl border-white/10 bg-[#0E0C1A] text-white"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-transparent text-white/70 hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="rounded-2xl bg-[#7C5CFC] text-white hover:bg-[#6B4CEB]"
              onClick={handleCreate}
              disabled={pending || form.name.trim().length < 3}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
