"use client";

import { useState, useEffect, useCallback } from "react";
import { getMembers, updateMemberStatus, deleteMember, getAllMembersForExport } from "@/lib/actions/members";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { FileSpreadsheet, FileText, Search, Loader2, Eye, Check, X, Trash2, Filter, MoreHorizontal, UserCircle2 } from "lucide-react";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  
  const { toast } = useToast();

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers(currentPage, 10, debouncedSearch, statusFilter);
      setMembers(data.members || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, toast]);

  // Execute fetch when dependencies change
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle Search Debounce (updates debouncedSearch after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when filter changes
  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (memberId, status) => {
    const res = await updateMemberStatus(memberId, status);
    if (res.success) {
      toast({ title: "Sukses", description: `Status diubah menjadi ${status}` });
      fetchMembers();
      setSelectedMember(null);
    } else {
      toast({ title: "Error", description: "Gagal mengubah status", variant: "destructive" });
    }
  };

  const handleDelete = async (memberId) => {
    if (!confirm("Yakin ingin menghapus member ini secara permanen?")) return;
    const res = await deleteMember(memberId);
    if (res.success) {
      toast({ title: "Sukses", description: "Member berhasil dihapus" });
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
    page.drawText("Data Member Dominator XI", { x: 50, y, size: 20, font, color: rgb(0.48, 0.36, 0.98) });
    
    y -= 30;
    data.slice(0, 30).forEach((m, i) => { 
      page.drawText(`${i+1}. ${m.fullName} - ${m.fcMobileNickname} (OVR: ${m.ovr}) - ${m.status}`, {
        x: 50, y, size: 10, font
      });
      y -= 15;
    });

    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes]), "DominatorXI_Members.pdf");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1F2430]">Member List</h2>
          <p className="text-sm text-[#7A8499]">Kelola data pendaftaran dan status anggota.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 border-[#E8ECF4] bg-white text-[#7C5CFC] shadow-sm hover:bg-[#F4F6FB] hover:text-[#7C5CFC]" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
          <Button variant="outline" className="h-10 gap-2 border-[#E8ECF4] bg-white text-[#FF5A7A] shadow-sm hover:bg-[#F4F6FB] hover:text-[#FF5A7A]" onClick={exportPDF}>
            <FileText className="h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-[#E8ECF4] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#E8ECF4] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA3B5]" />
            <Input 
              placeholder="Cari nama, nickname..." 
              className="h-10 pl-9 border-[#E8ECF4] bg-white focus-visible:ring-[#7C5CFC]/30 shadow-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-10 border-[#E8ECF4] bg-white shadow-none focus:ring-[#7C5CFC]/30">
                <div className="flex items-center gap-2 text-[#4E5669]">
                  <Filter className="h-4 w-4 text-[#9AA3B5]" />
                  <SelectValue placeholder="Status" />
                </div>
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

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#F8FAFC]">
              <TableRow className="border-[#E8ECF4] hover:bg-transparent">
                <TableHead className="h-12 text-xs font-semibold text-[#7A8499] uppercase tracking-wider pl-6">Profil Member</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-[#7A8499] uppercase tracking-wider">Game Info</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-[#7A8499] uppercase tracking-wider">Domisili</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-[#7A8499] uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-12 text-xs font-semibold text-[#7A8499] uppercase tracking-wider text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-[#9AA3B5]">
                      <Loader2 className="h-6 w-6 animate-spin text-[#7C5CFC] mb-2" />
                      <p className="text-sm">Memuat data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center text-[#9AA3B5]">
                      <UserCircle2 className="h-10 w-10 mb-3 opacity-20" />
                      <p className="text-sm">Tidak ada member ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} className="border-[#E8ECF4] transition-colors hover:bg-[#F4F6FB]/50">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] font-bold">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#1F2430]">{member.fullName}</span>
                          <span className="text-xs text-[#7A8499]">{format(new Date(member.joinDate), "dd MMM yyyy")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#1F2430]">{member.fcMobileNickname}</span>
                        <span className="text-xs text-[#7A8499]">OVR <span className="font-bold text-[#7C5CFC]">{member.ovr}</span></span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm text-[#4E5669]">{member.city}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        member.status === "accepted" ? "bg-[#E6F8F0] text-[#00A86B]" :
                        member.status === "rejected" ? "bg-[#FFEAF0] text-[#FF5A7A]" :
                        "bg-[#FFF2D9] text-[#F39C12]"
                      )}>
                        {member.status === "accepted" ? "Diterima" : member.status === "rejected" ? "Ditolak" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A8499] hover:text-[#7C5CFC] hover:bg-[#7C5CFC]/10" onClick={() => setSelectedMember(member)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A8499] hover:text-[#FF5A7A] hover:bg-[#FF5A7A]/10" onClick={() => handleDelete(member.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between border-t border-[#E8ECF4] p-4 bg-[#F8FAFC]/50">
          <span className="text-sm text-[#7A8499]">Menampilkan <span className="font-medium text-[#1F2430]">{total}</span> total data</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 border-[#E8ECF4] bg-white text-[#4E5669]" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Prev
            </Button>
            <span className="flex items-center px-2 text-sm text-[#4E5669] font-medium">
              Hal {currentPage} / {Math.max(1, pages)}
            </span>
            <Button variant="outline" size="sm" className="h-8 border-[#E8ECF4] bg-white text-[#4E5669]" disabled={currentPage === pages || pages === 0} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={selectedMember !== null} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md bg-white border-[#E8ECF4] shadow-xl p-0 overflow-hidden">
          {selectedMember && (
            <>
              <div className="bg-[#F8FAFC] px-6 py-5 flex items-center gap-4 border-b border-[#E8ECF4]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5CFC]/10 text-[#7C5CFC] font-bold text-xl">
                  {selectedMember.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1F2430] leading-none">{selectedMember.fullName}</h3>
                  <p className="text-sm text-[#7A8499] mt-1">Status: <span className={cn(
                    "font-semibold",
                    selectedMember.status === "accepted" ? "text-[#00A86B]" :
                    selectedMember.status === "rejected" ? "text-[#FF5A7A]" : "text-[#F39C12]"
                  )}>{selectedMember.status.toUpperCase()}</span></p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-[#9AA3B5] mb-1">Nickname</span>
                    <span className="block font-semibold text-[#1F2430]">{selectedMember.fcMobileNickname}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#9AA3B5] mb-1">OVR</span>
                    <span className="inline-flex h-6 items-center rounded-md bg-[#7C5CFC]/10 px-2 text-xs font-bold text-[#7C5CFC]">{selectedMember.ovr}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-[#9AA3B5] mb-1">Domisili</span>
                    <span className="block font-medium text-[#1F2430]">{selectedMember.city}, {selectedMember.province}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#9AA3B5] mb-1">Tanggal Lahir</span>
                    <span className="block font-medium text-[#1F2430]">{format(new Date(selectedMember.birthDate), "dd MMM yyyy", { locale: id })}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-[#9AA3B5] mb-1">Mendaftar Pada</span>
                    <span className="block font-medium text-[#1F2430]">{format(new Date(selectedMember.joinDate), "dd MMM yy, HH:mm", { locale: id })}</span>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-6 border-t border-[#E8ECF4] mt-2">
                  {selectedMember.status !== "accepted" && (
                    <Button className="h-10 bg-[#00A86B] hover:bg-[#00925c] text-white flex-1" onClick={() => handleStatusUpdate(selectedMember.id, "accepted")}>
                      <Check className="mr-2 h-4 w-4" /> Terima
                    </Button>
                  )}
                  {selectedMember.status !== "rejected" && (
                    <Button variant="outline" className="h-10 border-[#FFEAF0] bg-[#FFEAF0] text-[#FF5A7A] hover:bg-[#FFD1DD] hover:text-[#FF5A7A] flex-1" onClick={() => handleStatusUpdate(selectedMember.id, "rejected")}>
                      <X className="mr-2 h-4 w-4" /> Tolak
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
