"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trophy, Users, Trash2 } from "lucide-react";
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
  draft: "bg-slate-100 text-slate-600",
  open: "bg-emerald-100 text-emerald-700",
  closed: "bg-amber-100 text-amber-700",
  match: "bg-violet-100 text-violet-700",
  finished: "bg-sky-100 text-sky-700",
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
      setForm({ name: "", description: "", bracketType: "single", maxParticipants: 16 });
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
            className="rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(124,92,252,0.08)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                    STATUS_STYLE[t.status] || STATUS_STYLE.draft
                  )}
                >
                  {t.status}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[#1F2430]">{t.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#8A93A6]">
                  {t.description || "Tanpa deskripsi"}
                </p>
              </div>
              <Trophy className="h-5 w-5 text-[#7C5CFC]" />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-[#8A93A6]">
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {t._count?.entries ?? 0}/{t.maxParticipants}
              </span>
              <span className="capitalize">{t.bracketType} elim</span>
            </div>

            <div className="mt-5 flex gap-2">
              <Button
                asChild
                className="h-10 flex-1 rounded-2xl bg-[#7C5CFC] text-sm font-semibold text-white hover:bg-[#6B4CEB]"
              >
                <Link href={`/admin/tournaments/${t.id}`}>Kelola</Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-2xl border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={() => handleDelete(t.id)}
                disabled={pending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {sorted.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-[#D9DEEA] bg-white/70 p-10 text-center text-sm text-[#8A93A6] md:col-span-2 xl:col-span-3">
            Belum ada turnamen. Buat yang pertama.
          </div>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-0 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Turnamen</DialogTitle>
            <DialogDescription>
              Single atau double elimination. Status awal: draft.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="h-11 rounded-2xl"
                placeholder="Dominator Cup S1"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="h-11 rounded-2xl"
                placeholder="Turnamen internal komunitas"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipe Bracket</Label>
                <div className="grid grid-cols-2 gap-1 rounded-2xl border border-input bg-transparent p-1">
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
                          : "text-[#5C6578] hover:bg-[#F3F0FF]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Peserta</Label>
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
                  className="h-11 rounded-2xl"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl"
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
