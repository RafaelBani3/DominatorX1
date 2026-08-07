import { redirect } from "next/navigation";

export const metadata = {
  title: "Onboarding - Dominator XI",
  description: "Daftar untuk bergabung dengan komunitas FC Mobile Dominator XI.",
};

export default function OnboardingPage() {
  redirect("/?join=1");
}
