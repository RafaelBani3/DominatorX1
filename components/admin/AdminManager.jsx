"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdmin, updateAdmin, deleteAdmin } from "@/lib/actions/admin";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PERMISSIONS = [
  { id: "members:read", label: "Read Members" },
  { id: "members:write", label: "Manage Members" },
  { id: "settings:read", label: "Read Settings" },
  { id: "settings:write", label: "Manage Settings" },
  { id: "admins:read", label: "Read Admins" },
  { id: "admins:write", label: "Manage Admins" },
];

export default function AdminManager({ initialAdmins }) {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: [],
  });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "admin", permissions: [] });
    setEditingId(null);
  };

  const openEdit = (admin) => {
    setForm({
      name: admin.name,
      email: admin.email,
      password: "", // don't show password
      role: admin.role,
      permissions: admin.permissions || [],
    });
    setEditingId(admin.id);
    setIsOpen(true);
  };

  const handlePermissionChange = (id, checked) => {
    setForm(prev => {
      if (checked) return { ...prev, permissions: [...prev.permissions, id] };
      return { ...prev, permissions: prev.permissions.filter(p => p !== id) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (editingId) {
        res = await updateAdmin(editingId, form);
      } else {
        res = await createAdmin(form);
      }

      if (res.success) {
        toast({ title: "Success", description: "Data admin berhasil disimpan." });
        setIsOpen(false);
        resetForm();
        window.location.reload(); // Quick refresh to get updated data
      } else {
        toast({ title: "Error", description: res.error, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Terjadi kesalahan sistem.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus admin ini?")) return;
    
    setLoading(true);
    const res = await deleteAdmin(id);
    setLoading(false);
    
    if (res.success) {
      toast({ title: "Success", description: "Admin berhasil dihapus." });
      setAdmins(prev => prev.filter(a => a.id !== id));
    } else {
      toast({ title: "Error", description: res.error, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Admin Management</h2>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-white shadow hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" /> Tambah Admin
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-white/10">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Admin" : "Tambah Admin Baru"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required={!editingId} className="bg-black/20" />
              </div>
              {!editingId && (
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="bg-black/20" />
                </div>
              )}
              
              <div className="space-y-2 pt-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {PERMISSIONS.map(perm => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={perm.id} 
                        checked={form.permissions.includes(perm.id) || form.role === "superadmin"} 
                        onCheckedChange={(checked) => handlePermissionChange(perm.id, checked)}
                        disabled={form.role === "superadmin"}
                      />
                      <Label htmlFor={perm.id} className="text-sm font-normal cursor-pointer">{perm.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Checkbox 
                  id="superadmin" 
                  checked={form.role === "superadmin"} 
                  onCheckedChange={(checked) => setForm({...form, role: checked ? "superadmin" : "admin"})}
                />
                <Label htmlFor="superadmin" className="font-bold text-primary">Jadikan Super Admin</Label>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-white/10">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">Tidak ada data admin.</TableCell>
                </TableRow>
              ) : (
                admins.map(admin => (
                  <TableRow key={admin.id} className="border-white/10 hover:bg-white/5">
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", admin.role === "superadmin" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground")}>
                        {admin.role === "superadmin" ? "Super Admin" : "Admin"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(admin.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
