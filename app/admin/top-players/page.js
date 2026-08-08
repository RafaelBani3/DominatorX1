import { getTopPlayers } from "@/lib/actions/top-players";
import TopPlayersAdminClient from "./TopPlayersAdminClient";

export const metadata = {
  title: "Kelola Top Players - Admin Dominator XI",
};

export default async function AdminTopPlayersPage() {
  const players = await getTopPlayers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2430]">Top Players</h1>
          <p className="mt-1 text-sm text-[#7A8499]">
            Kelola daftar 10 pemain terbaik untuk setiap role.
          </p>
        </div>
      </div>
      <TopPlayersAdminClient initialPlayers={players} />
    </div>
  );
}
