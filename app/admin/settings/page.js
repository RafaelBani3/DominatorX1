import { getSettings } from "@/lib/actions/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = {
  title: "Settings - Admin Dominator XI",
};

export default async function SettingsPage() {
  const settings = await getSettings();

  return <SettingsForm initialSettings={settings} />;
}
