import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetTournament } from "@/lib/actions/admin-tournaments";
import TournamentDetailAdminClient from "@/components/admin/TournamentDetailAdminClient";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Kelola Turnamen - Admin Dominator XI",
};

export default async function AdminTournamentDetailPage({ params }) {
  const { id } = await params;
  const tournament = await adminGetTournament(id);
  if (!tournament) notFound();

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" className="rounded-xl px-0 text-[#7C5CFC]">
        <Link href="/admin/tournaments">← Kembali ke daftar</Link>
      </Button>
      <TournamentDetailAdminClient tournament={tournament} />
    </div>
  );
}
