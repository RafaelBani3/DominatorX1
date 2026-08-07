"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, LayoutDashboard, Settings, LogOut, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!isPending && !session) {
      router.replace("/admin/login");
    }
  }, [isPending, session, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Memeriksa sesi admin...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/admin/login";
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Admins", href: "/admin/users", icon: ShieldAlert },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary font-bold text-white">
            D
          </div>
          <span className="text-lg font-bold">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border border-primary/30 bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end border-b border-border bg-card px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {session.user?.name || session.user?.email || "Admin"}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-xs font-bold text-primary">
              {(session.user?.name || session.user?.email || "A")
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-muted/30 p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
