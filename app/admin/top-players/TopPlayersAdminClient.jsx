"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createTopPlayer, deleteTopPlayer } from "@/lib/actions/admin-top-players";

const ROLES = ["LW", "ST", "RW", "CF", "LM", "RM", "CM", "CDM", "LB", "CB", "RB", "LWB", "RWB", "GK"];

export default function TopPlayersAdminClient({ initialPlayers }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    role: "ST",
    image: "", // Base64
    statsObj: { PAC: 90, SHO: 90, PAS: 90, DRI: 90, DEF: 90, PHY: 90 },
    playstyle: "",
    ovr: 90,
    skillMoves: 5,
    weakFoot: 5,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await createTopPlayer({
        ...formData,
        stats: JSON.stringify(formData.statsObj),
        ovr: parseInt(formData.ovr, 10),
        skillMoves: parseInt(formData.skillMoves, 10),
        weakFoot: parseInt(formData.weakFoot, 10),
      });

      if (res.success) {
        toast({ title: "Berhasil", description: "Pemain berhasil ditambahkan." });
        setIsAdding(false);
        // Optimistic update would be better, but revalidatePath in server action handles the refetch on page reload
        window.location.reload();
      } else {
        toast({ title: "Gagal", description: res.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Format Statistik JSON tidak valid.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pemain ini?")) return;
    setLoading(true);
    const res = await deleteTopPlayer(id);
    if (res.success) {
      toast({ title: "Berhasil", description: "Pemain dihapus." });
      setPlayers(players.filter(p => p.id !== id));
    } else {
      toast({ title: "Gagal", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8ECF4]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1F2430]">Daftar Pemain</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white">
          {isAdding ? "Batal" : <><Plus className="mr-2 h-4 w-4" /> Tambah Pemain</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl bg-slate-50 p-6 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nama Pemain</label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Misal: Ronaldo" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Role / Posisi</label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">OVR (Rating)</label>
              <Input required type="number" value={formData.ovr} onChange={e => setFormData({...formData, ovr: e.target.value})} placeholder="90" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Skill Moves (1-5)</label>
              <Input required type="number" min="1" max="5" value={formData.skillMoves} onChange={e => setFormData({...formData, skillMoves: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Weak Foot (1-5)</label>
              <Input required type="number" min="1" max="5" value={formData.weakFoot} onChange={e => setFormData({...formData, weakFoot: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Playstyle (Opsional)</label>
              <Input value={formData.playstyle} onChange={e => setFormData({...formData, playstyle: e.target.value})} placeholder="Misal: Poacher, Target Man" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Gambar Pemain (Max 1MB disarankan)</label>
              <Input required type="file" accept="image/*" onChange={handleImageUpload} />
              {formData.image && <img src={formData.image} alt="Preview" className="mt-2 h-20 object-contain bg-slate-200 rounded p-1" />}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Statistik Pemain</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'].map((stat) => (
                  <div key={stat}>
                    <label className="text-xs font-semibold text-slate-500">{stat}</label>
                    <Input 
                      required 
                      type="number" 
                      value={formData.statsObj[stat]} 
                      onChange={e => setFormData({
                        ...formData, 
                        statsObj: { ...formData.statsObj, [stat]: parseInt(e.target.value) || 0 }
                      })} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Simpan Pemain
          </Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#7A8499]">
          <thead className="border-b border-[#E8ECF4] bg-slate-50 text-xs uppercase text-[#4D5562]">
            <tr>
              <th className="px-4 py-3 font-semibold">Pemain</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">OVR</th>
              <th className="px-4 py-3 font-semibold">Playstyle</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center">Belum ada data pemain.</td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id} className="border-b border-[#E8ECF4] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {player.image && (
                      <div className="relative h-10 w-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <Image src={player.image} alt={player.name} fill className="object-contain" />
                      </div>
                    )}
                    <span className="font-semibold text-slate-900">{player.name}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{player.role}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">
                      {player.ovr}
                    </span>
                  </td>
                  <td className="px-4 py-3">{player.playstyle || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(player.id)} disabled={loading} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
