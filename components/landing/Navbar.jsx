"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar({ onJoin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-b border-white/10 bg-black/55 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[4.25rem] md:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/LOGO.png"
              alt=""
              fill
              className="object-contain"
              sizes="36px"
            />
          </div>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-[0.06em] text-white">
            DOMINATOR XI
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            { href: "#about", label: "Tentang" },
            { href: "#benefits", label: "Benefit" },
            { href: "#faq", label: "FAQ" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="hidden h-9 rounded-lg px-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white md:inline-flex"
          >
            <Link href="/admin/login">Dashboard</Link>
          </Button>
          <Button
            onClick={onJoin}
            className="h-9 rounded-lg bg-white px-4 text-sm font-semibold text-foreground hover:bg-white/90"
          >
            Daftar
          </Button>
        </div>
      </div>
    </header>
  );
}
