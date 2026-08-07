"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  ShieldAlert,
  Loader2,
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Members", href: "/admin/members", icon: Users },
  { name: "Admins", href: "/admin/users", icon: ShieldAlert },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function SidebarNav({ pathname, onNavigate }) {
  return (
    <nav className="mt-8 flex flex-1 flex-col gap-1.5 px-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!isPending && !session) {
      router.replace("/admin/login");
    }
  }, [isPending, session, pathname, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6FB]">
        <div className="flex flex-col items-center gap-3 text-[#7A8499]">
          <Loader2 className="h-8 w-8 animate-spin text-[#7C5CFC]" />
          <p className="text-sm">Memeriksa sesi admin...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/admin/login";
  };

  const displayName = session.user?.name || "Admin";
  const displayEmail = session.user?.email || "admin";
  const initial = displayName.charAt(0).toUpperCase();

  const sidebar = (
    <div className="flex h-full w-[260px] flex-col bg-[#7C5CFC] text-white">
      <div className="flex items-center gap-3 px-6 pt-7">
        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/25">
          <Image src="/LOGO.png" alt="" fill className="object-contain p-1.5" sizes="44px" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight">Dominator XI</p>
          <p className="text-xs text-white/70">Admin Dashboard</p>
        </div>
      </div>

      <SidebarNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />

      <div className="mt-auto px-5 pb-6">
        <div className="mb-4 rounded-[1.5rem] bg-white/10 p-4 ring-1 ring-white/15">
          <p className="text-sm font-semibold">Kelola komunitas</p>
          <p className="mt-1 text-xs leading-relaxed text-white/70">
            Pantau member, approval, dan performa squad dari satu tempat.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-[#7C5CFC]">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-[11px] text-white/65">Super Admin</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          className="mt-3 h-11 w-full rounded-2xl bg-white text-sm font-semibold text-[#7C5CFC] hover:bg-white/90"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] text-[#1F2430]">
      <aside className="sticky top-0 hidden h-screen shrink-0 md:block">{sidebar}</aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">{sidebar}</div>
        </div>
      ) : null}

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[#E8ECF4] bg-[#F4F6FB]/90 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl text-[#7C5CFC] md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="relative hidden w-full max-w-md sm:block">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#9AA3B5]" />
              <Input
                placeholder="Search here..."
                className="h-11 rounded-2xl border-0 bg-white pr-4 pl-11 text-sm shadow-[0_8px_24px_rgba(124,92,252,0.06)] placeholder:text-[#9AA3B5] focus-visible:ring-[#7C5CFC]/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7C5CFC] shadow-[0_8px_24px_rgba(124,92,252,0.08)]"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FF5A7A]" />
            </button>

            <div className="flex items-center gap-3 rounded-full bg-white py-1.5 pr-4 pl-1.5 shadow-[0_8px_24px_rgba(124,92,252,0.08)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C5CFC] text-sm font-bold text-white">
                {initial}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-[11px] text-[#8A93A6]">{displayEmail}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
