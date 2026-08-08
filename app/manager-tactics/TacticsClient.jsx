"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import { useRouter } from "next/navigation";
import { getTactic } from "@/lib/actions/tactics";
import { Loader2 } from "lucide-react";

export default function TacticsClient({ initialFormations }) {
  const router = useRouter();
  const [selectedFormation, setSelectedFormation] = useState("");
  const [tactic, setTactic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = () => {
    router.push("/?join=1");
  };

  const handleSearch = async () => {
    if (!selectedFormation) return;
    setLoading(true);
    setError(null);
    setTactic(null);
    
    try {
      const result = await getTactic(selectedFormation);
      if (result) {
        setTactic(result);
      } else {
        setError(`Taktik untuk formasi ${selectedFormation} belum ditambahkan oleh admin.`);
      }
    } catch (err) {
      setError("Gagal mengambil data taktik.");
    } finally {
      setLoading(false);
    }
  };

  const renderTacticCategory = (title, dataStr, colorClass) => {
    if (!dataStr) return null;
    let data = {};
    try {
      data = JSON.parse(dataStr);
    } catch {
      data = { "Description": dataStr };
    }

    return (
      <div className={`p-6 rounded-2xl bg-white/5 border border-white/10 ${colorClass}`}>
        <h3 className="text-xl font-[family-name:var(--font-display)] tracking-wider mb-4 border-b border-white/10 pb-2">{title}</h3>
        <div className="space-y-3 text-sm">
          {Object.entries(data).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center bg-black/40 px-4 py-2 rounded-lg">
              <span className="text-white/70 font-medium">{key}</span>
              <span className="text-white font-bold">{val}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar onJoin={handleJoin} />
      
      {/* Search Section */}
      <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto mb-12">
        <select
          value={selectedFormation}
          onChange={(e) => setSelectedFormation(e.target.value)}
          className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="" disabled className="text-black">Pilih Formasi...</option>
          {initialFormations.length > 0 ? (
            initialFormations.map(form => (
              <option key={form} value={form} className="text-black">{form}</option>
            ))
          ) : (
            <option disabled className="text-black">Belum ada data formasi</option>
          )}
        </select>
        <button
          onClick={handleSearch}
          disabled={!selectedFormation || loading}
          className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px]"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lihat Taktik"}
        </button>
      </div>

      {/* Results Section */}
      {error && (
        <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {tactic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderTacticCategory("Build Up", tactic.buildUp, "hover:border-blue-500/50")}
          {renderTacticCategory("Offense", tactic.offense, "hover:border-rose-500/50")}
          {renderTacticCategory("Defense", tactic.defense, "hover:border-emerald-500/50")}
        </div>
      )}
      
      {!tactic && !error && !loading && (
        <div className="text-center text-white/30 mt-20">
          <div className="text-5xl mb-4">📋</div>
          <p>Pilih formasi untuk melihat rekomendasi taktik.</p>
        </div>
      )}
    </>
  );
}
