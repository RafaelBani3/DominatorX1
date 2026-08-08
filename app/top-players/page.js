import { getTopPlayers } from "@/lib/actions/top-players";
import TopPlayersClient from "./TopPlayersClient";

export const metadata = {
  title: "Top Players - Dominator XI",
  description: "Lihat 10 Pemain Terbaik berdasarkan Role di FC Mobile.",
};

export default async function TopPlayersPage() {
  const players = await getTopPlayers();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/30">
      <div className="pt-24 pb-12 px-5 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold mb-4 tracking-wide text-center uppercase bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Top Pemain Terbaik
        </h1>
        <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto text-sm md:text-base">
          Rekomendasi pemain terbaik di setiap posisi untuk memperkuat skuad FC Mobile Anda. 
          Pilih role di bawah ini untuk melihat daftarnya.
        </p>
        <TopPlayersClient initialPlayers={players} />
      </div>
    </main>
  );
}
