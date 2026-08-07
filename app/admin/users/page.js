import { getAdmins } from "@/lib/actions/admin";
import AdminManager from "@/components/admin/AdminManager";

export const metadata = {
  title: "Admin Management - Dominator XI",
};

export default async function AdminUsersPage() {
  const admins = await getAdmins();

  return <AdminManager initialAdmins={admins} />;
}
