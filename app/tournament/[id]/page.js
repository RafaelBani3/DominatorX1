import { notFound } from "next/navigation";
import { getPublicTournament } from "@/lib/actions/tournaments";
import TournamentDetailClient from "@/components/tournament/TournamentDetailClient";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const t = await getPublicTournament(id);
  return {
    title: t ? `${t.name} - Dominator XI` : "Turnamen - Dominator XI",
  };
}

export default async function TournamentDetailPage({ params }) {
  const { id } = await params;
  const tournament = await getPublicTournament(id);
  if (!tournament) notFound();

  return <TournamentDetailClient tournament={tournament} />;
}
