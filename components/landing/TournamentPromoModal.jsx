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

const DISMISS_KEY = "tournamentPromoDismissed";
const DISMISS_MS = 24 * 60 * 60 * 1000;

export default function TournamentPromoModal({ tournaments = [] }) {
  const [open, setOpen] = useState(false);

  const featured =
    tournaments.find((t) => t.status === "open") ||
    tournaments.find((t) => t.status === "match") ||
    null;

  useEffect(() => {
    if (!featured) return;
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_MS) {
        return;
      }
    } catch {}

    const timer = setTimeout(() => setOpen(true), 1800);
    return () => clearTimeout(timer);
  }, [featured]);

  const persistDismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
  };

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) persistDismiss();
  };

  const scrollToSection = () => {
    persistDismiss();
    setOpen(false);
    const el = document.getElementById("tournaments");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!featured) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-black/65 backdrop-blur-sm"
        className="overflow-hidden border-0 bg-white p-0 sm:max-w-md sm:rounded-3xl"
      >
        <div className="bg-gradient-to-br from-[#7C5CFC] to-[#9B84FF] px-6 py-8 text-white">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Trophy className="h-6 w-6" />
          </div>
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="text-2xl font-bold text-white">
              {featured.status === "open"
                ? "Turnamen Dibuka!"
                : "Turnamen Sedang Berjalan"}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/80">
              <span className="font-semibold text-white">{featured.name}</span>
              {" — "}
              {featured.status === "open"
                ? "Daftar sekarang dengan nickname & no HP, tanpa login."
                : "Lihat bracket live dan pantau perjalanan squaddie."}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex flex-col gap-2 bg-white px-6 py-5">
          <Button
            onClick={scrollToSection}
            className="h-12 rounded-2xl bg-[#7C5CFC] font-semibold text-white hover:bg-[#6B4CEB]"
          >
            Lihat Turnamen
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            className="h-11 rounded-2xl text-[#8A93A6]"
          >
            Nanti Saja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
