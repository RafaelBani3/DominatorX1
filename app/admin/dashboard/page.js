import { getDashboardStats } from "@/lib/actions/analytics";
import DashboardClient from "@/components/admin/DashboardClient";

export const metadata = {
  title: "Dashboard - Admin Dominator XI",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}
