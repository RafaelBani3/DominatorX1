import { getAllTacticsAdmin } from "@/lib/actions/admin-tactics";
import TacticsAdminClient from "./TacticsAdminClient";

export const metadata = {
  title: "Kelola Taktik - Admin Dominator XI",
};

export default async function AdminTacticsPage() {
  const tactics = await getAllTacticsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2430]">Manager Tactics</h1>
          <p className="mt-1 text-sm text-[#7A8499]">
            Kelola rekomendasi taktik untuk setiap formasi.
          </p>
        </div>
      </div>
      <TacticsAdminClient initialTactics={tactics} />
    </div>
  );
}
