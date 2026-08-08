"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import { useRouter } from "next/navigation";

const ROLES = ["LW", "ST", "RW", "CF", "LM", "RM", "CM", "CDM", "LB", "CB", "RB", "LWB", "RWB", "GK"];

export default function TopPlayersClient({ initialPlayers }) {
  const [selectedRole, setSelectedRole] = useState("ST");
  const router = useRouter();

  const filteredPlayers = initialPlayers
    .filter((p) => p.role === selectedRole)
    .sort((a, b) => b.ovr - a.ovr)
    .slice(0, 10); // Top 10

  const handleJoin = () => {
    router.push("/?join=1");
  };

  return (
    <>
      <Navbar onJoin={handleJoin} />
      
      {/* Role Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
              selectedRole === role
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            )}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Players Grid */}
      {filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, index) => (
            <div
              key={player.id}
              className="group relative flex flex-col items-center p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 overflow-hidden hover:border-emerald-500/50 transition-all duration-500"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 flex items-center justify-center w-8 h-8 rounded-full bg-black/50 border border-white/20 text-white font-bold text-sm z-10">
                #{index + 1}
              </div>

              {/* OVR Badge */}
              <div className="absolute top-4 right-4 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-[family-name:var(--font-display)] px-2 py-1 rounded shadow-lg z-10">
                <span className="text-xl leading-none">{player.ovr}</span>
                <span className="text-[10px] font-bold leading-none">{player.role}</span>
              </div>

              {/* Player Image */}
              <div className="relative w-32 h-32 mb-4 mt-8 transition-transform duration-500 group-hover:scale-110">
                {player.image ? (
                  <Image
                    src={player.image}
                    alt={player.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center text-white/30 text-4xl">
                    ?
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div className="text-center w-full relative z-10">
                <h3 className="text-xl font-bold text-white truncate w-full mb-1">{player.name}</h3>
                
                {player.playstyle && (
                  <div className="inline-block px-3 py-1 mt-2 rounded bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                    {player.playstyle}
                  </div>
                )}

                {/* Stats */}
                {player.stats && (
                  <div className="flex gap-1.5 justify-center mt-4 w-full">
                    {Object.entries(JSON.parse(player.stats)).slice(0, 6).map(([key, value]) => (
                      <div key={key} className="flex flex-col items-center justify-center bg-[#202230] rounded-lg p-2 flex-1 shadow-inner border border-white/10">
                        <span className="text-white font-bold text-[13px] leading-none mb-1">{value}</span>
                        <span className="text-[9px] uppercase font-bold text-white/50 leading-none">{key}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Skill Moves & Weak Foot */}
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <div className="flex flex-col items-start">
                    <span className="text-white/40 mb-1">Skill Moves</span>
                    <div className="flex gap-0.5 text-yellow-500 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < (player.skillMoves || 0) ? "opacity-100" : "opacity-20 text-white"}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-white/40 mb-1">Weak Foot</span>
                    <div className="flex gap-0.5 text-yellow-500 text-[10px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < (player.weakFoot || 0) ? "opacity-100" : "opacity-20 text-white"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-white/40">
          <div className="text-6xl mb-4">⚽</div>
          <p>Belum ada pemain yang ditambahkan untuk posisi {selectedRole}.</p>
        </div>
      )}
    </>
  );
}
