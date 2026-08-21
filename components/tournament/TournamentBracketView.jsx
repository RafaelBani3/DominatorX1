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

  return (
    <div
      className={cn(
        "min-w-[180px] rounded-2xl border bg-white p-2 shadow-sm",
        ready ? "border-[#7C5CFC]/40" : "border-[#E8ECF4]"
      )}
    >
      <button
        type="button"
        disabled={!interactive || !ready || !match.player1EntryId || pending}
        onClick={() => pick(match.player1EntryId)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
          match.winnerEntryId === match.player1EntryId
            ? "bg-emerald-50 font-semibold text-emerald-700"
            : "hover:bg-[#F7F8FC]",
          interactive && ready && match.player1EntryId ? "cursor-pointer" : "cursor-default"
        )}
      >
        <span className="truncate">{labelFor(match.player1)}</span>
        {match.winnerEntryId === match.player1EntryId ? (
          <span className="text-[10px] uppercase">W</span>
        ) : null}
      </button>
      <div className="my-1 h-px bg-[#EEF1F7]" />
      <button
        type="button"
        disabled={!interactive || !ready || !match.player2EntryId || pending}
        onClick={() => pick(match.player2EntryId)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
          match.winnerEntryId === match.player2EntryId
            ? "bg-emerald-50 font-semibold text-emerald-700"
            : "hover:bg-[#F7F8FC]",
          interactive && ready && match.player2EntryId ? "cursor-pointer" : "cursor-default"
        )}
      >
        <span className="truncate">{labelFor(match.player2)}</span>
        {match.winnerEntryId === match.player2EntryId ? (
          <span className="text-[10px] uppercase">W</span>
        ) : null}
      </button>
      {done ? (
        <p className="mt-1 text-center text-[10px] font-medium text-[#8A93A6]">Selesai</p>
      ) : ready ? (
        <p className="mt-1 text-center text-[10px] font-medium text-[#7C5CFC]">
          {interactive ? "Klik pemenang" : "Siap digelar"}
        </p>
      ) : (
        <p className="mt-1 text-center text-[10px] text-[#A0A8B8]">Menunggu</p>
      )}
    </div>
  );
}

function BracketColumn({ title, matches, interactive, onPickWinner, pending }) {
  if (!matches.length) return null;
  return (
    <div className="flex min-w-[200px] flex-col gap-4">
      <p className="text-center text-xs font-bold tracking-wide text-[#8A93A6] uppercase">
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
      <div className="rounded-3xl border border-dashed border-[#D9DEEA] bg-white/80 p-10 text-center text-sm text-[#8A93A6]">
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
    <div className="space-y-8 overflow-x-auto pb-2">
      <div>
        <p className="mb-3 text-sm font-bold text-[#1F2430]">
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
          <p className="mb-3 text-sm font-bold text-[#1F2430]">Losers Bracket</p>
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
          <p className="mb-3 text-sm font-bold text-[#1F2430]">Grand Final</p>
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
