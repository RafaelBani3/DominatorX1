"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Hero from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import OnboardingModal from "@/components/onboarding/OnboardingModal";

export default function LandingShell({ settings = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("join") === "1") {
      setOpen(true);
    }
  }, [searchParams]);

  const handleOpenChange = useCallback(
    (next) => {
      setOpen(next);
      if (!next && searchParams.get("join") === "1") {
        router.replace(pathname, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  const openJoin = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onJoin={openJoin} />
      <main className="flex-1">
        <Hero onJoin={openJoin} />
      </main>
      <OnboardingModal
        open={open}
        onOpenChange={handleOpenChange}
        settings={settings}
      />
    </div>
  );
}
