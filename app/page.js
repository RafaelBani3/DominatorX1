import { Suspense } from "react";
import LandingShell from "@/components/landing/LandingShell";
import { getSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let settings = {};
  try {
    settings = await getSettings();
  } catch {
    settings = {};
  }

  return (
    <Suspense fallback={null}>
      <LandingShell settings={settings} />
    </Suspense>
  );
}
