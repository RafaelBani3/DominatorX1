import { getAllFormations } from "@/lib/actions/tactics";
import TacticsClient from "./TacticsClient";

export const metadata = {
  title: "Manager Tactics - Dominator XI",
  description: "Rekomendasi taktik Manager Mode FC Mobile terbaik.",
};

export default async function ManagerTacticsPage() {
  const formations = await getAllFormations();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/30">
      <div className="pt-24 pb-12 px-5 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold mb-4 tracking-wide text-center uppercase bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
          Manager Tactics
        </h1>
        <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Temukan pengaturan taktik terbaik untuk Manager Mode FC Mobile berdasarkan formasi andalan Anda.
        </p>
        <TacticsClient initialFormations={formations} />
      </div>
    </main>
  );
}
