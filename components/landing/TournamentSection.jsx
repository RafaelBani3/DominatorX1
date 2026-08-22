"use client";

import Link from "next/link";
import { Trophy, Users, ArrowRight, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COPY = {
  open: {
    label: "Pendaftaran Dibuka",
    className: "bg-emerald-500/20 text-emerald-200 ring-emerald-400/30",
  },
  match: {
    label: "Sedang Berjalan",
    className: "bg-violet-500/20 text-violet-200 ring-violet-400/30",
  },
  finished: {
    label: "Selesai",
    className: "bg-sky-500/20 text-sky-200 ring-sky-400/30",
  },
  closed: {
    label: "Pendaftaran Ditutup",
    className: "bg-amber-500/20 text-amber-100 ring-amber-400/30",
  },
};

export default function TournamentSection({ tournaments = [] }) {
  return (
    <section
      id="tournaments"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-[#06110C]/70 py-20 backdrop-blur-sm"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,0.12),transparent_45%),radial-gradient(circle_at_90%_80%,rgba(124,92,252,0.1),transparent_40%)]"
      />
      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-emerald-300/90 uppercase">
            <Swords className="h-3.5 w-3.5" />
            Internal Cup
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-wide text-white md:text-5xl">
            Turnamen Dominator XI
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
            Daftar dengan nickname & nomor HP — tanpa login. Bracket digenerate
            acak oleh admin.
          </p>
        </div>

        {tournaments.length === 0 ? (
          <p className="mt-12 text-center text-sm text-white/55">
            Belum ada turnamen aktif. Pantau terus halaman ini.
          </p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const meta = STATUS_COPY[t.status] || STATUS_COPY.closed;
              return (
                <Link
                  key={t.id}
                  href={`/tournament/${t.id}`}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B1512]/85 p-6 transition hover:border-emerald-400/35 hover:bg-[#0E1C16]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl transition group-hover:bg-emerald-400/20"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                        meta.className
                      )}
                    >
                      {meta.label}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 ring-1 ring-emerald-300/20">
                      <Trophy className="h-4 w-4 text-emerald-300" />
                    </div>
                  </div>
                  <h3 className="relative mt-4 text-xl font-bold text-white">
                    {t.name}
                  </h3>
                  <p className="relative mt-2 line-clamp-2 text-sm text-white/65">
                    {t.description ||
                      "Turnamen internal komunitas Dominator XI."}
                  </p>
                  <div className="relative mt-5 flex items-center justify-between text-xs text-white/55">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-emerald-300/80" />
                      {t._count?.entries ?? 0}/{t.maxParticipants}
                    </span>
                    <span className="capitalize">{t.bracketType} elim</span>
                  </div>
                  <span className="relative mt-5 inline-flex items-center text-sm font-semibold text-emerald-300 transition-all group-hover:gap-2">
                    Lihat detail
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
