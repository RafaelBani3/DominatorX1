import { adminListTournaments } from "@/lib/actions/admin-tournaments";
import TournamentsAdminClient from "@/components/admin/TournamentsAdminClient";

export const metadata = {
  title: "Tournaments - Admin Dominator XI",
};

export default async function AdminTournamentsPage() {
  const tournaments = await adminListTournaments();
  return <TournamentsAdminClient initialTournaments={tournaments} />;
}
