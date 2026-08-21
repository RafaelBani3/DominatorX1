/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import TournamentSection from "@/components/landing/TournamentSection";
import TournamentPromoModal from "@/components/landing/TournamentPromoModal";

export default function LandingShell({
  settings = {},
  tournaments = [],
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasJoinParam = searchParams.get("join") === "1";
    let hasSavedOpen = false;
    try {
      hasSavedOpen = localStorage.getItem("dominator_onboarding_open") === "true";
    } catch {}
    if (hasJoinParam || hasSavedOpen) {
      setOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = useCallback(
    (next) => {
      setOpen(next);
      try {
        if (next) {
          localStorage.setItem("dominator_onboarding_open", "true");
        } else {
          localStorage.removeItem("dominator_onboarding_open");
          if (searchParams.get("join") === "1") {
            router.replace(pathname, { scroll: false });
          }
        }
      } catch {}
    },
    [pathname, router, searchParams]
  );

  const openJoin = useCallback(() => {
    try {
      localStorage.setItem("dominator_onboarding_open", "true");
    } catch {}
    setOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onJoin={openJoin} />
      <main className="flex-1">
        <Hero onJoin={openJoin} />
        <TournamentSection tournaments={tournaments} />
      </main>
      <OnboardingModal
        open={open}
        onOpenChange={handleOpenChange}
        settings={settings}
      />
      <TournamentPromoModal
        tournaments={tournaments}
        blocked={open}
      />
    </div>
  );
}
