"use client";

import { cn } from "@/lib/utils";

function labelFor(entry) {
  if (!entry) return "TBD";
  return entry.nickname || entry.displayName || "Player";
}

function MatchCard({
  match,
  interactive = false,
  onPickWinner,
  pending = false,
}) {
  const done = match.status === "done";
  const ready = match.status === "ready";

  const pick = (entryId) => {
    if (!interactive || !ready || pending || !entryId) return;
    onPickWinner?.(match.id, entryId);
  };

  const slotClass = (isWinner, canPick) =>
    cn(
      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition",
      isWinner
        ? "bg-emerald-500/20 font-semibold text-emerald-200 ring-1 ring-emerald-400/30"
        : "text-white/85 hover:bg-white/5",
      canPick ? "cursor-pointer" : "cursor-default"
    );

  return (
    <div
      className={cn(
        "min-w-[190px] overflow-hidden rounded-2xl border bg-gradient-to-b from-[#1A2838] to-[#121C28] p-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.35)]",
        ready
          ? "border-emerald-400/40 shadow-[0_0_0_1px_rgba(52,211,153,0.15),0_12px_28px_rgba(0,0,0,0.35)]"
          : done
            ? "border-white/10"
            : "border-white/8"
      )}
    >
      <button
        type="button"
        disabled={!interactive || !ready || !match.player1EntryId || pending}
        onClick={() => pick(match.player1EntryId)}
        className={slotClass(
          match.winnerEntryId === match.player1EntryId,
          interactive && ready && match.player1EntryId
        )}
      >
        <span className="truncate">{labelFor(match.player1)}</span>
        {match.winnerEntryId === match.player1EntryId ? (
          <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300 uppercase">
            W
          </span>
        ) : null}
      </button>
      <div className="mx-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <button
        type="button"
        disabled={!interactive || !ready || !match.player2EntryId || pending}
        onClick={() => pick(match.player2EntryId)}
        className={slotClass(
          match.winnerEntryId === match.player2EntryId,
          interactive && ready && match.player2EntryId
        )}
      >
        <span className="truncate">{labelFor(match.player2)}</span>
        {match.winnerEntryId === match.player2EntryId ? (
          <span className="rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-300 uppercase">
            W
          </span>
        ) : null}
      </button>
      {done ? (
        <p className="mt-1 pb-1 text-center text-[10px] font-medium text-white/40">
          Selesai
        </p>
      ) : ready ? (
        <p className="mt-1 pb-1 text-center text-[10px] font-semibold text-emerald-300/90">
          {interactive ? "Klik pemenang" : "Siap digelar"}
        </p>
      ) : (
        <p className="mt-1 pb-1 text-center text-[10px] text-white/30">Menunggu</p>
      )}
    </div>
  );
}

function BracketColumn({ title, matches, interactive, onPickWinner, pending }) {
  if (!matches.length) return null;
  return (
    <div className="flex min-w-[210px] flex-col gap-4">
      <p className="text-center text-[11px] font-bold tracking-[0.14em] text-emerald-300/70 uppercase">
        {title}
      </p>
      <div className="flex flex-1 flex-col justify-around gap-6">
        {matches.map((m) => (
          <MatchCard
            key={m.id}
            match={m}
            interactive={interactive}
            onPickWinner={onPickWinner}
            pending={pending}
          />
        ))}
      </div>
    </div>
  );
}

export default function TournamentBracketView({
  matches = [],
  bracketType = "single",
  interactive = false,
  onPickWinner,
  pending = false,
}) {
  if (!matches.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/15 bg-[#0F1720]/80 p-10 text-center text-sm text-white/45">
        Bracket belum digenerate.
      </div>
    );
  }

  const winners = matches.filter((m) => m.bracketSide === "winners");
  const losers = matches.filter((m) => m.bracketSide === "losers");
  const finals = matches.filter((m) => m.bracketSide === "final");

  const winnerRounds = [...new Set(winners.map((m) => m.round))].sort(
    (a, b) => a - b
  );
  const loserRounds = [...new Set(losers.map((m) => m.round))].sort(
    (a, b) => a - b
  );

  return (
    <div className="space-y-10 overflow-x-auto pb-2">
      <div>
        <p className="mb-4 text-sm font-bold tracking-wide text-white">
          {bracketType === "double" ? "Winners Bracket" : "Bracket"}
        </p>
        <div className="flex gap-8">
          {winnerRounds.map((round) => (
            <BracketColumn
              key={`w-${round}`}
              title={
                round === Math.max(...winnerRounds)
                  ? bracketType === "double"
                    ? "Winners Final"
                    : "Final"
                  : `Round ${round}`
              }
              matches={winners.filter((m) => m.round === round)}
              interactive={interactive}
              onPickWinner={onPickWinner}
              pending={pending}
            />
          ))}
        </div>
      </div>

      {bracketType === "double" && loserRounds.length ? (
        <div>
          <p className="mb-4 text-sm font-bold tracking-wide text-white">
            Losers Bracket
          </p>
          <div className="flex gap-8">
            {loserRounds.map((round) => (
              <BracketColumn
                key={`l-${round}`}
                title={`Losers R${round}`}
                matches={losers.filter((m) => m.round === round)}
                interactive={interactive}
                onPickWinner={onPickWinner}
                pending={pending}
              />
            ))}
          </div>
        </div>
      ) : null}

      {finals.length ? (
        <div>
          <p className="mb-4 text-sm font-bold tracking-wide text-white">
            Grand Final
          </p>
          <div className="flex gap-8">
            <BracketColumn
              title="Grand Final"
              matches={finals}
              interactive={interactive}
              onPickWinner={onPickWinner}
              pending={pending}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
