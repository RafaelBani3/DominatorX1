"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createTactic, deleteTactic } from "@/lib/actions/admin-tactics";

export default function TacticsAdminClient({ initialTactics }) {
  const [tactics, setTactics] = useState(initialTactics);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    formation: "",
    buildUp: "",
    offense: "",
    defense: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validasi JSON (opsional, tapi disarankan)
      [formData.buildUp, formData.offense, formData.defense].forEach(val => {
        if (val) JSON.parse(val);
      });

      const res = await createTactic(formData);
      if (res.success) {
        toast({ title: "Berhasil", description: "Taktik berhasil ditambahkan." });
        setIsAdding(false);
        window.location.reload();
      } else {
        toast({ title: "Gagal", description: res.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Pastikan Build Up, Offense, dan Defense menggunakan format JSON yang valid.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus taktik ini?")) return;
    setLoading(true);
    const res = await deleteTactic(id);
    if (res.success) {
      toast({ title: "Berhasil", description: "Taktik dihapus." });
      setTactics(tactics.filter(t => t.id !== id));
    } else {
      toast({ title: "Gagal", description: res.error, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8ECF4]">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1F2430]">Daftar Taktik</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white">
          {isAdding ? "Batal" : <><Plus className="mr-2 h-4 w-4" /> Tambah Taktik</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 space-y-4 rounded-xl bg-slate-50 p-6 border border-slate-200">
          <div>
            <label className="text-sm font-medium text-slate-700">Formasi</label>
            <Input required value={formData.formation} onChange={e => setFormData({...formData, formation: e.target.value})} placeholder="Misal: 4-3-3 Holding" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Build Up (JSON)</label>
              <textarea
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={5}
                placeholder='{"Speed": 3, "Passing Distance": 1, "Mentality": "Attacking"}'
                value={formData.buildUp}
                onChange={e => setFormData({...formData, buildUp: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Offense (JSON)</label>
              <textarea
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={5}
                placeholder='{"Passing Rate": 2, "Crossing Rate": 2, "Shooting Tendency": 2, "Positioning": "Organized"}'
                value={formData.offense}
                onChange={e => setFormData({...formData, offense: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Defense (JSON)</label>
              <textarea
                required
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={5}
                placeholder='{"Pressure": 3, "Width": 2, "Aggression": 3, "Backline": "Cover"}'
                value={formData.defense}
                onChange={e => setFormData({...formData, defense: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Simpan Taktik
          </Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#7A8499]">
          <thead className="border-b border-[#E8ECF4] bg-slate-50 text-xs uppercase text-[#4D5562]">
            <tr>
              <th className="px-4 py-3 font-semibold">Formasi</th>
              <th className="px-4 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tactics.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-8 text-center">Belum ada taktik.</td>
              </tr>
            ) : (
              tactics.map((t) => (
                <tr key={t.id} className="border-b border-[#E8ECF4] hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{t.formation}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} disabled={loading} className="text-red-500 hover:bg-red-50 hover:text-red-600">
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
