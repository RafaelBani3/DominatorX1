"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Share } from "lucide-react";
import Image from "next/image";

const DISMISS_KEY = "pwaPromptDismissed";
const DISMISS_MS = 24 * 60 * 60 * 1000;

const BENEFITS = [
  "Aman digunakan",
  "Tidak mengambil kontak",
  "Tidak mengambil galeri",
  "Data pribadi aman dan tidak disalahgunakan",
  "Bebas malware & iklan",
];

export default function PWAInstallModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(isPWA);
    if (isPWA) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_MS) {
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    let timer;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      timer = setTimeout(() => setShowModal(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosDevice) {
      timer = setTimeout(() => setShowModal(true), 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const persistDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setShowModal(false);
    persistDismiss();
  };

  const handleDismiss = () => {
    setShowModal(false);
    persistDismiss();
  };

  const handleOpenChange = (open) => {
    setShowModal(open);
    if (!open) persistDismiss();
  };

  if (isStandalone || (!deferredPrompt && !isIOS)) return null;

  return (
    <Dialog open={showModal} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="bg-black/65 backdrop-blur-sm"
        className="gap-0 overflow-hidden border border-border bg-white p-0 text-foreground shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="relative border-b border-border bg-white px-6 pb-6 pt-10">
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border">
            <Image
              src="/LOGO.png"
              alt="Dominator XI"
              width={56}
              height={56}
              className="object-contain"
            />
          </div>
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-wide text-foreground">
              Install Dominator XI
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Pasang di Home Screen agar lebih cepat diakses seperti aplikasi
              native.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 bg-white px-6 py-5">
          <ul className="space-y-2.5">
            {BENEFITS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-foreground"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          {isIOS && !deferredPrompt && (
            <p className="flex flex-wrap items-center justify-center gap-1.5 rounded-xl bg-muted px-3 py-3 text-center text-xs leading-relaxed text-muted-foreground">
              Tap ikon Share
              <Share className="inline h-3.5 w-3.5" />
              lalu pilih{" "}
              <strong className="text-foreground">Add to Home Screen</strong>
            </p>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col gap-2 rounded-none border-t border-border bg-muted px-6 py-4 sm:flex-col sm:justify-stretch">
          {(!isIOS || deferredPrompt) && (
            <Button
              onClick={handleInstall}
              className="h-12 w-full rounded-xl text-sm font-semibold"
            >
              Install Sekarang
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="h-11 w-full rounded-xl bg-white text-sm font-medium"
          >
            Nanti Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
