"use client";

import { useState } from "react";
import { updateSettings } from "@/lib/actions/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

export default function SettingsForm({ initialSettings }) {
  const [settings, setSettings] = useState({
    community_name: initialSettings.community_name || "Dominator XI",
    logo_url: initialSettings.logo_url || "",
    tiktok_link: initialSettings.tiktok_link || "https://www.tiktok.com/@dominator_fcm/photo/7667739169640172821?is_from_webapp=1&sender_device=pc&web_id=7662197260352931345",
    instagram_link: initialSettings.instagram_link || "https://www.instagram.com/p/DacuC5Ay7cp/",
    youtube_link: initialSettings.youtube_link || "https://youtube.com/shorts/QXV6YR6T04U?feature=share",
    whatsapp_channel_link: initialSettings.whatsapp_channel_link || "https://whatsapp.com/channel/0029Vb5aadbK5cD5YbbVP73Y",
    whatsapp_link: initialSettings.whatsapp_link || "https://chat.whatsapp.com/FkZf7UL7HQ0E768p3eB2DM",
    disclaimer: initialSettings.disclaimer || "Saya memahami bahwa keputusan bergabung ke komunitas ini merupakan keputusan pribadi saya. Apabila di kemudian hari terjadi kesalahpahaman dengan orang tua maupun wali, maka hal tersebut bukan menjadi tanggung jawab admin maupun komunitas.",
    join_requirements: initialSettings.join_requirements || "Tunjukkan dukungan Anda dengan mengikuti kanal sosial media resmi kami.",
  });
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await updateSettings(settings);
    setLoading(false);
    
    if (res.success) {
      toast({ title: "Success", description: "Pengaturan berhasil disimpan" });
    } else {
      toast({ title: "Error", description: res.error || "Gagal menyimpan", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan Website</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>Identitas Komunitas</CardTitle>
            <CardDescription>Ubah nama dan logo komunitas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Komunitas</Label>
              <Input name="community_name" value={settings.community_name} onChange={handleChange} className="bg-black/20" />
            </div>
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input name="logo_url" value={settings.logo_url} onChange={handleChange} placeholder="https://..." className="bg-black/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>Sosial Media & Kontak</CardTitle>
            <CardDescription>Link yang akan digunakan oleh member untuk follow dan bergabung.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link TikTok</Label>
                <Input name="tiktok_link" value={settings.tiktok_link} onChange={handleChange} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label>Link Instagram</Label>
                <Input name="instagram_link" value={settings.instagram_link} onChange={handleChange} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label>Link YouTube</Label>
                <Input name="youtube_link" value={settings.youtube_link} onChange={handleChange} className="bg-black/20" />
              </div>
              <div className="space-y-2">
                <Label>Link Saluran WhatsApp</Label>
                <Input name="whatsapp_channel_link" value={settings.whatsapp_channel_link} onChange={handleChange} className="bg-black/20" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Link WhatsApp Group (Untuk yang lulus)</Label>
                <Input name="whatsapp_link" value={settings.whatsapp_link} onChange={handleChange} className="bg-black/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle>Teks Informasi</CardTitle>
            <CardDescription>Ubah disclaimer dan informasi lainnya di website.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Disclaimer (Untuk member di bawah umur)</Label>
              <Textarea name="disclaimer" value={settings.disclaimer} onChange={handleChange} className="bg-black/20 h-24" />
            </div>
            <div className="space-y-2">
              <Label>Persyaratan Join</Label>
              <Textarea name="join_requirements" value={settings.join_requirements} onChange={handleChange} className="bg-black/20 h-24" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} className="px-8 font-bold">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
