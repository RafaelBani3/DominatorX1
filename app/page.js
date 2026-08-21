import { Suspense } from "react";
import LandingShell from "@/components/landing/LandingShell";
import { getSettings } from "@/lib/actions/settings";
import { getPublicTournaments } from "@/lib/actions/tournaments";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let settings = {};
  let tournaments = [];
  try {
    settings = await getSettings();
  } catch {
    settings = {};
  }
  try {
    tournaments = await getPublicTournaments();
  } catch {
    tournaments = [];
  }

  return (
    <Suspense fallback={null}>
      <LandingShell settings={settings} tournaments={tournaments} />
    </Suspense>
  );
}
