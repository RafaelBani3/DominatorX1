"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DISMISS_PREFIX = "tournamentPromoDismissed:";
const DISMISS_MS = 24 * 60 * 60 * 1000;

function dismissKey(id) {
  return `${DISMISS_PREFIX}${id}`;
}

function wasDismissed(id) {
  try {
    const raw = localStorage.getItem(dismissKey(id));
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < DISMISS_MS;
  } catch {
    return false;
  }
}

function persistDismiss(id) {
  try {
    localStorage.setItem(dismissKey(id), Date.now().toString());
  } catch {}
}

export default function TournamentPromoModal({
  tournaments = [],
  blocked = false,
}) {
  const [open, setOpen] = useState(false);

  const featured =
    tournaments.find((t) => t.status === "open") ||
    tournaments.find((t) => t.status === "match") ||
    null;

  const featuredId = featured?.id ?? null;
  const canJoin = featured?.status === "open";

  useEffect(() => {
    if (!featuredId || blocked) {
      setOpen(false);
      return;
    }
    if (wasDismissed(featuredId)) return;

    const timer = setTimeout(() => setOpen(true), 1400);
    return () => clearTimeout(timer);
  }, [featuredId, blocked]);

  const close = () => {
    if (featuredId) persistDismiss(featuredId);
    setOpen(false);
  };

  const handleJoin = () => {
    if (featuredId) persistDismiss(featuredId);
    setOpen(false);

    // Wait for dialog unmount so scroll isn't blocked by focus trap
    requestAnimationFrame(() => {
      const el = document.getElementById("tournaments");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  };

  if (!featured) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
        else setOpen(true);
      }}
    >
      <DialogContent className="overflow-hidden border-0 bg-[#0B1F14] p-0 text-white shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="relative overflow-hidden px-6 pb-2 pt-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.35),transparent_55%),radial-gradient(circle_at_90%_30%,rgba(16,185,129,0.2),transparent_45%)]"
          />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 ring-1 ring-emerald-300/30">
              <Trophy className="h-6 w-6 text-emerald-300" />
            </div>
            <DialogHeader className="gap-2 space-y-0 text-left">
              <DialogTitle className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-white">
                {canJoin ? "Mau ikut turnamen?" : "Turnamen sedang berjalan"}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-white/70">
                <span className="font-semibold text-emerald-300">
                  {featured.name}
                </span>
                {canJoin
                  ? " lagi buka pendaftaran. Ikut sekarang dengan nickname & nomor HP — tanpa login."
                  : " sudah mulai. Scroll ke bawah untuk lihat bracket & info peserta."}
              </DialogDescription>
            </DialogHeader>
            {(featured._count?.entries != null || featured.maxParticipants) && (
              <p className="mt-4 text-xs text-white/50">
                {featured._count?.entries ?? 0}/{featured.maxParticipants} peserta
                {canJoin ? " · slot masih tersedia" : ""}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex flex-col gap-2 border-t border-white/10 bg-black/25 px-6 py-5">
          <Button
            onClick={handleJoin}
            className="h-12 rounded-2xl bg-emerald-400 font-semibold text-[#062012] hover:bg-emerald-300"
          >
            {canJoin ? "Ya, mau ikut" : "Lihat turnamen"}
          </Button>
          <Button
            variant="ghost"
            onClick={close}
            className="h-11 rounded-2xl text-white/60 hover:bg-white/5 hover:text-white"
          >
            {canJoin ? "Tidak dulu" : "Nanti saja"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
