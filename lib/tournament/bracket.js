/**
 * Tournament bracket builders — single & double elimination.
 * Works with plain entry objects { id } and returns match blueprints
 * (without DB ids) that admin actions persist.
 */

export function shuffleEntries(entries) {
  const arr = [...entries];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function emptyMatch(partial) {
  return {
    round: 0,
    bracketSide: "winners",
    matchIndex: 0,
    player1EntryId: null,
    player2EntryId: null,
    winnerEntryId: null,
    nextMatchKey: null,
    nextSlot: null,
    loserNextMatchKey: null,
    loserNextSlot: null,
    status: "pending",
    tempKey: null,
    ...partial,
  };
}

/**
 * Build single-elimination bracket.
 * Returns { matches: MatchBlueprint[], championFromKey }
 */
export function buildSingleElimination(entries) {
  if (!entries?.length || entries.length < 2) {
    throw new Error("Minimal 2 peserta untuk generate bracket");
  }

  const shuffled = shuffleEntries(entries);
  const size = nextPowerOfTwo(shuffled.length);
  const byes = size - shuffled.length;
  const slots = [
    ...shuffled.map((e) => e.id),
    ...Array(byes).fill(null),
  ];

  const matches = [];
  const roundCount = Math.log2(size);
  // round 1 match count = size/2
  let prevRoundKeys = [];

  for (let round = 1; round <= roundCount; round++) {
    const matchCount = size / Math.pow(2, round);
    const roundKeys = [];

    for (let i = 0; i < matchCount; i++) {
      const key = `W-R${round}-M${i}`;
      roundKeys.push(key);

      let player1EntryId = null;
      let player2EntryId = null;
      let status = "pending";
      let winnerEntryId = null;

      if (round === 1) {
        player1EntryId = slots[i * 2];
        player2EntryId = slots[i * 2 + 1];
        if (player1EntryId && !player2EntryId) {
          winnerEntryId = player1EntryId;
          status = "done";
        } else if (!player1EntryId && player2EntryId) {
          winnerEntryId = player2EntryId;
          status = "done";
        } else if (player1EntryId && player2EntryId) {
          status = "ready";
        }
      }

      const nextRound = round + 1;
      const nextMatchKey =
        round < roundCount ? `W-R${nextRound}-M${Math.floor(i / 2)}` : null;
      const nextSlot = round < roundCount ? (i % 2 === 0 ? 1 : 2) : null;

      matches.push(
        emptyMatch({
          tempKey: key,
          round,
          bracketSide: "winners",
          matchIndex: i,
          player1EntryId,
          player2EntryId,
          winnerEntryId,
          nextMatchKey,
          nextSlot,
          status,
        })
      );
    }
    prevRoundKeys = roundKeys;
  }

  // Auto-advance byes into next round slots in memory
  applyAutoAdvances(matches);

  return { matches, type: "single" };
}

/**
 * Double elimination: winners bracket + losers bracket + grand final.
 * Simplified mapping: losers from winners Rk feed losers bracket sequentially.
 */
export function buildDoubleElimination(entries) {
  if (!entries?.length || entries.length < 2) {
    throw new Error("Minimal 2 peserta untuk generate bracket");
  }

  const shuffled = shuffleEntries(entries);
  const size = nextPowerOfTwo(shuffled.length);
  const byes = size - shuffled.length;
  const slots = [
    ...shuffled.map((e) => e.id),
    ...Array(byes).fill(null),
  ];

  const matches = [];
  const winnersRounds = Math.log2(size);

  // --- Winners bracket ---
  for (let round = 1; round <= winnersRounds; round++) {
    const matchCount = size / Math.pow(2, round);
    for (let i = 0; i < matchCount; i++) {
      const key = `W-R${round}-M${i}`;
      let player1EntryId = null;
      let player2EntryId = null;
      let status = "pending";
      let winnerEntryId = null;

      if (round === 1) {
        player1EntryId = slots[i * 2];
        player2EntryId = slots[i * 2 + 1];
        if (player1EntryId && !player2EntryId) {
          winnerEntryId = player1EntryId;
          status = "done";
        } else if (!player1EntryId && player2EntryId) {
          winnerEntryId = player2EntryId;
          status = "done";
        } else if (player1EntryId && player2EntryId) {
          status = "ready";
        }
      }

      const nextMatchKey =
        round < winnersRounds
          ? `W-R${round + 1}-M${Math.floor(i / 2)}`
          : "GF-M0";
      const nextSlot = round < winnersRounds ? (i % 2 === 0 ? 1 : 2) : 1;

      // Loser drop: round 1 losers go to L-R1, later rounds to corresponding L rounds
      const loserRound = round;
      const loserMatchIndex = i;
      const loserNextMatchKey = `L-R${loserRound}-M${loserMatchIndex}`;
      const loserNextSlot = 1;

      matches.push(
        emptyMatch({
          tempKey: key,
          round,
          bracketSide: "winners",
          matchIndex: i,
          player1EntryId,
          player2EntryId,
          winnerEntryId,
          nextMatchKey,
          nextSlot,
          loserNextMatchKey,
          loserNextSlot,
          status,
        })
      );
    }
  }

  // --- Losers bracket ---
  // For each winners round, create losers matches that receive drop-ins,
  // then a consolidation round when needed.
  let losersRound = 1;
  // Initial losers round: one match per winners R1 match (awaiting drop-in + sometimes bye)
  const r1Count = size / 2;
  for (let i = 0; i < r1Count; i++) {
    const key = `L-R1-M${i}`;
    const nextMatchKey =
      r1Count === 1
        ? "GF-M0"
        : `L-R2-M${Math.floor(i / 2)}`;
    const nextSlot = r1Count === 1 ? 2 : i % 2 === 0 ? 1 : 2;

    matches.push(
      emptyMatch({
        tempKey: key,
        round: 1,
        bracketSide: "losers",
        matchIndex: i,
        nextMatchKey,
        nextSlot,
        status: "pending",
      })
    );
  }

  // Subsequent losers rounds until one winner
  let prevLosersCount = r1Count;
  losersRound = 2;
  while (prevLosersCount > 1) {
    // Drop-in round from winners (if corresponding winners round exists)
    const dropCount = prevLosersCount; // each previous losers winner waits / pairs
    // Pair previous losers winners
    const pairCount = Math.ceil(prevLosersCount / 2);
    for (let i = 0; i < pairCount; i++) {
      const key = `L-R${losersRound}-M${i}`;
      const isLast = pairCount === 1;
      const nextMatchKey = isLast ? "GF-M0" : `L-R${losersRound + 1}-M${Math.floor(i / 2)}`;
      const nextSlot = isLast ? 2 : i % 2 === 0 ? 1 : 2;

      // Wire winners round drop-ins into loser slot 2 where applicable
      const winnersRoundForDrop = Math.min(losersRound, winnersRounds);
      // Update corresponding winners matches' loserNext to feed slot 2 of this losers match when indices align
      matches
        .filter(
          (m) =>
            m.bracketSide === "winners" &&
            m.round === winnersRoundForDrop &&
            m.matchIndex === i
        )
        .forEach((m) => {
          m.loserNextMatchKey = key;
          m.loserNextSlot = 2;
        });

      matches.push(
        emptyMatch({
          tempKey: key,
          round: losersRound,
          bracketSide: "losers",
          matchIndex: i,
          nextMatchKey,
          nextSlot,
          status: "pending",
        })
      );
    }
    prevLosersCount = pairCount;
    losersRound += 1;
  }

  // Ensure winners final loser also drops toward last losers path if needed
  const winnersFinal = matches.find(
    (m) => m.bracketSide === "winners" && m.round === winnersRounds
  );
  if (winnersFinal) {
    const lastLosers = matches
      .filter((m) => m.bracketSide === "losers")
      .sort((a, b) => b.round - a.round || a.matchIndex - b.matchIndex)[0];
    if (lastLosers && lastLosers.tempKey !== "GF-M0") {
      // If last losers goes to GF, winners final loser should feed that match slot 2
      // Prefer feeding a dedicated losers final if exists
      winnersFinal.loserNextMatchKey = lastLosers.tempKey;
      winnersFinal.loserNextSlot = 2;
    }
  }

  // --- Grand Final ---
  matches.push(
    emptyMatch({
      tempKey: "GF-M0",
      round: 1,
      bracketSide: "final",
      matchIndex: 0,
      nextMatchKey: null,
      nextSlot: null,
      status: "pending",
    })
  );

  applyAutoAdvances(matches);

  return { matches, type: "double" };
}

function applyAutoAdvances(matches) {
  const byKey = Object.fromEntries(matches.map((m) => [m.tempKey, m]));
  let changed = true;
  let guard = 0;
  while (changed && guard < 50) {
    changed = false;
    guard += 1;
    for (const m of matches) {
      if (m.status === "done" && m.winnerEntryId && m.nextMatchKey) {
        const next = byKey[m.nextMatchKey];
        if (!next) continue;
        const slot = m.nextSlot === 2 ? "player2EntryId" : "player1EntryId";
        if (!next[slot]) {
          next[slot] = m.winnerEntryId;
          changed = true;
          updateMatchReadyState(next);
        }
      }
      // Bye already set winner — also push loser path only if there was a real loser (skip for bye)
    }
  }
}

function updateMatchReadyState(m) {
  if (m.winnerEntryId) {
    m.status = "done";
    return;
  }
  if (m.player1EntryId && m.player2EntryId) {
    m.status = "ready";
  } else if (m.player1EntryId && !m.player2EntryId && m.bracketSide === "winners") {
    // leave pending until opponent arrives (except R1 byes handled at create)
  }
}

/**
 * Pure advance helper for in-memory / post-load graph.
 * Mutates match map: { [id]: match }
 */
export function computeAdvance(matchesById, matchId, winnerEntryId) {
  const match = matchesById[matchId];
  if (!match) throw new Error("Match tidak ditemukan");
  if (match.status === "done" && match.winnerEntryId) {
    throw new Error("Match sudah selesai");
  }

  const p1 = match.player1EntryId;
  const p2 = match.player2EntryId;
  if (!p1 || !p2) throw new Error("Kedua slot pemain harus terisi");
  if (winnerEntryId !== p1 && winnerEntryId !== p2) {
    throw new Error("Pemenang harus salah satu peserta match");
  }

  const loserEntryId = winnerEntryId === p1 ? p2 : p1;
  match.winnerEntryId = winnerEntryId;
  match.status = "done";

  const updates = [match];

  if (match.nextMatchId) {
    const next = matchesById[match.nextMatchId];
    if (next) {
      if (match.nextSlot === 2) next.player2EntryId = winnerEntryId;
      else next.player1EntryId = winnerEntryId;
      if (next.player1EntryId && next.player2EntryId && next.status !== "done") {
        next.status = "ready";
      }
      updates.push(next);
    }
  }

  if (match.loserNextMatchId && loserEntryId) {
    const loserNext = matchesById[match.loserNextMatchId];
    if (loserNext) {
      if (match.loserNextSlot === 2) loserNext.player2EntryId = loserEntryId;
      else loserNext.player1EntryId = loserEntryId;
      if (
        loserNext.player1EntryId &&
        loserNext.player2EntryId &&
        loserNext.status !== "done"
      ) {
        loserNext.status = "ready";
      }
      updates.push(loserNext);
    }
  }

  return { match, loserEntryId, updates };
}

export function isTournamentComplete(matches) {
  if (!matches.length) return false;
  const finals = matches.filter((m) => m.bracketSide === "final");
  if (finals.length) {
    return finals.every((m) => m.status === "done" && m.winnerEntryId);
  }
  const maxRound = Math.max(...matches.map((m) => m.round));
  const last = matches.filter(
    (m) => m.bracketSide === "winners" && m.round === maxRound
  );
  return last.length === 1 && last[0].status === "done" && last[0].winnerEntryId;
}
