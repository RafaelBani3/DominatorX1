"use client";

import { useState, useEffect } from "react";
import { getMembers, updateMemberStatus, deleteMember, getAllMembersForExport } from "@/lib/actions/members";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileSpreadsheet, FileText, Search, Loader2, Eye, Check, X, Trash2 } from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { cn } from "@/lib/utils";

export default function MemberList() {
  const [members, setMembers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    const data = await getMembers(currentPage, 10, search, statusFilter);
    setMembers(data.members);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [currentPage, statusFilter]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusUpdate = async (memberId, status) => {
    const res = await updateMemberStatus(memberId, status);
    if (res.success) {
      toast({ title: "Success", description: `Status berhasil diubah menjadi ${status}` });
      fetchMembers();
      setSelectedMember(null);
    } else {
      toast({ title: "Error", description: "Gagal mengubah status", variant: "destructive" });
    }
  };

  const handleDelete = async (memberId) => {
    if (!confirm("Hapus member ini?")) return;
    const res = await deleteMember(memberId);
    if (res.success) {
      toast({ title: "Success", description: "Member berhasil dihapus" });
      fetchMembers();
    } else {
      toast({ title: "Error", description: "Gagal menghapus member", variant: "destructive" });
    }
  };

  const exportExcel = async () => {
    const data = await getAllMembersForExport();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Members");
    
    sheet.columns = [
      { header: "Nama Lengkap", key: "fullName", width: 25 },
      { header: "Nickname", key: "fcMobileNickname", width: 20 },
      { header: "OVR", key: "ovr", width: 10 },
      { header: "Domisili", key: "city", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Join Date", key: "joinDate", width: 20 },
    ];

    data.forEach(m => {
      sheet.addRow({
        ...m,
        joinDate: format(new Date(m.joinDate), "dd MMM yyyy")
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "DominatorXI_Members.xlsx");
  };

  const exportPDF = async () => {
    const data = await getAllMembersForExport();
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const page = pdfDoc.addPage();
    
    let y = page.getHeight() - 50;
    page.drawText("Data Member Dominator XI", { x: 50, y, size: 20, font, color: rgb(0.5, 0.2, 0.9) });
    
    y -= 30;
    data.slice(0, 30).forEach((m, i) => { // Just a simple export for demo
      page.drawText(`${i+1}. ${m.fullName} - ${m.fcMobileNickname} (OVR: ${m.ovr}) - ${m.status}`, {
        x: 50, y, size: 10, font
      });
      y -= 15;
    });

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes]), "DominatorXI_Members.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Member List</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" onClick={exportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" onClick={exportPDF}>
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-md border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari nama, nickname, domisili..." 
                className="pl-9 bg-black/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-black/20">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Diterima</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-white/10">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-white/10">
                  <TableHead>Nama</TableHead>
                  <TableHead>Nickname (OVR)</TableHead>
                  <TableHead>Domisili</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Tidak ada data.</TableCell>
                  </TableRow>
                ) : (
                  members.map(member => (
                    <TableRow key={member.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium">{member.fullName}</TableCell>
                      <TableCell>{member.fcMobileNickname} <span className="text-primary font-bold">({member.ovr})</span></TableCell>
                      <TableCell>{member.city}, {member.province}</TableCell>
                      <TableCell>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-semibold",
                          member.status === "accepted" ? "bg-green-500/20 text-green-500" :
                          member.status === "rejected" ? "bg-red-500/20 text-red-500" :
                          "bg-yellow-500/20 text-yellow-500"
                        )}>
                          {member.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedMember(member)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">Total {total} data</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
              <span className="flex items-center px-2 text-sm">Hal {currentPage} / {pages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === pages || pages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-[500px] bg-card border-white/10">
          <DialogHeader>
            <DialogTitle>Detail Member</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm border-b border-white/10 pb-4">
                <span className="text-muted-foreground">Nama Lengkap</span>
                <span className="col-span-2 font-medium">{selectedMember.fullName}</span>
                
                <span className="text-muted-foreground">Nickname</span>
                <span className="col-span-2 font-medium">{selectedMember.fcMobileNickname}</span>
                
                <span className="text-muted-foreground">OVR</span>
                <span className="col-span-2 font-medium">{selectedMember.ovr}</span>
                
                <span className="text-muted-foreground">Domisili</span>
                <span className="col-span-2 font-medium">{selectedMember.city}, {selectedMember.province}</span>
                
                <span className="text-muted-foreground">Tanggal Lahir</span>
                <span className="col-span-2 font-medium">{format(new Date(selectedMember.birthDate), "dd MMMM yyyy", { locale: id })}</span>
                
                <span className="text-muted-foreground">Tanggal Daftar</span>
                <span className="col-span-2 font-medium">{format(new Date(selectedMember.joinDate), "dd MMMM yyyy HH:mm", { locale: id })}</span>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                {selectedMember.status !== "accepted" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(selectedMember.id, "accepted")}>
                    <Check className="mr-2 h-4 w-4" /> Terima
                  </Button>
                )}
                {selectedMember.status !== "rejected" && (
                  <Button variant="destructive" onClick={() => handleStatusUpdate(selectedMember.id, "rejected")}>
                    <X className="mr-2 h-4 w-4" /> Tolak
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
