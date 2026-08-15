/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/lib/validations/onboarding";
import { format, differenceInYears } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, CheckCircle2, Trophy, Shield, Gamepad2, AlertCircle, CalendarIcon, ChevronDown, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import regions from "@/lib/regions.json";
import { cn } from "@/lib/utils";
import { submitOnboarding } from "@/lib/actions/onboarding";
import { getSettings } from "@/lib/actions/settings";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  { id: 1, title: "Verifikasi Umur", icon: <Shield className="w-5 h-5" /> },
  { id: 2, title: "Data Diri", icon: <Gamepad2 className="w-5 h-5" /> },
  { id: 3, title: "Kemampuan", icon: <Trophy className="w-5 h-5" /> },
  { id: 4, title: "Persyaratan", icon: <CheckCircle2 className="w-5 h-5" /> },
  { id: 5, title: "Review", icon: <AlertCircle className="w-5 h-5" /> },
];

function SearchableSelect({ value, onChange, options, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className={cn(
            "w-full h-14 justify-between bg-background border-border rounded-xl text-md shadow-sm font-normal",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          <span className="truncate">{value ? value : placeholder}</span>
          <ChevronDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input 
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="Cari..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-[250px] overflow-y-auto overflow-x-hidden p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Tidak ditemukan.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                  value === item ? "bg-accent text-accent-foreground font-medium" : ""
                )}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {value === item && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                {item}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

const DRAFT_KEY = "dominator_onboarding_draft";

export default function MultiStepForm({
  settings = {},
  embedded = false,
  onCancel,
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [liveSettings, setLiveSettings] = useState(settings);
  
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    getSettings()
      .then((data) => {
        if (isMounted && data && typeof data === "object") {
          setLiveSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
    return () => {
      isMounted = false;
    };
  }, []);

  const tiktokLink = liveSettings.tiktok_link || "";
  const instagramLink = liveSettings.instagram_link || "";
  const youtubeLink = liveSettings.youtube_link || "";
  const whatsappChannelLink = liveSettings.whatsapp_channel_link || "";
  const whatsappGroupLink = liveSettings.whatsapp_link || "";
  const disclaimerText = liveSettings.disclaimer || "Saya memahami bahwa keputusan bergabung ke komunitas ini merupakan keputusan pribadi saya. Apabila di kemudian hari terjadi kesalahpahaman dengan orang tua maupun wali, maka hal tersebut bukan menjadi tanggung jawab admin maupun komunitas.";
  const joinRequirementsText = liveSettings.join_requirements || "Tunjukkan dukungan Anda dengan mengikuti kanal sosial media resmi kami.";
  const communityName = liveSettings.community_name || "Dominator XI";

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem("dominator_onboarding_open");
    } catch {}
  };

  const handleCancel = () => {
    clearDraft();
    if (onCancel) onCancel();
    else window.location.href = "/";
  };

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      phoneOwner: "",
      phoneChecked: "",
      warningAccept: false,
      socialTikTok: false,
      socialInstagram: false,
      socialYouTube: false,
      socialWhatsappChannel: false,
      canScore30: "",
    },
    mode: "onChange",
  });

  const { watch, setValue, reset, formState: { errors } } = form;
  const values = watch();

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (parsed.birthDate) {
            parsed.birthDate = new Date(parsed.birthDate);
          }
          if (parsed.currentStep && parsed.currentStep >= 1 && parsed.currentStep <= 5) {
            setCurrentStep(parsed.currentStep);
          }
          reset(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore onboarding draft", e);
    } finally {
      setIsRestored(true);
    }
  }, [reset]);

  // Persist draft to localStorage on values or currentStep change (after restored)
  useEffect(() => {
    if (!isRestored) return;
    try {
      const draft = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
        currentStep,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.error("Failed to save onboarding draft", e);
    }
  }, [values, currentStep, isRestored]);

  // Handle immediate state saving on social link click
  const handleVisitSocial = (key) => {
    setValue(key, true, { shouldValidate: true, shouldDirty: true });
    try {
      const draft = {
        ...form.getValues(),
        [key]: true,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
        currentStep: 4,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      localStorage.setItem("dominator_onboarding_open", "true");
    } catch (e) {
      console.error("Failed to save social click", e);
    }
  };

  // Instant rejection logic
  useEffect(() => {
    if (values.phoneOwner === "orang_tua") {
      clearDraft();
      setRejectionReason(`Mohon maaf. Saat ini Anda belum dapat bergabung ke komunitas ${communityName} karena alasan Parent Permission (Handphone milik orang tua). Terima kasih.`);
      submitOnboarding({ ...values, status: "rejected", reason: "Parent Permission - Not Owned" });
    }
  }, [values.phoneOwner, communityName]);

  useEffect(() => {
    if (values.phoneChecked === "ya") {
      clearDraft();
      setRejectionReason(`Mohon maaf. Saat ini Anda belum dapat bergabung ke komunitas ${communityName} karena alasan Parent Permission (Handphone sering diperiksa orang tua). Terima kasih.`);
      submitOnboarding({ ...values, status: "rejected", reason: "Parent Permission - Monitored" });
    }
  }, [values.phoneChecked, communityName]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!values.birthDate) {
        toast({ title: "Perhatian", description: "Pilih tanggal lahir Anda secara lengkap", variant: "destructive" });
        return;
      }
      const age = differenceInYears(new Date(), values.birthDate);
      if (age < 15) {
        if (!values.phoneOwner) {
          toast({ title: "Perhatian", description: "Pilih kepemilikan handphone", variant: "destructive" });
          return;
        }
        if (values.phoneOwner === "sendiri") {
          if (!values.phoneChecked) {
            toast({ title: "Perhatian", description: "Pilih intensitas pemeriksaan", variant: "destructive" });
            return;
          }
          if (values.phoneChecked === "terkadang" && !values.warningAccept) {
            toast({ title: "Perhatian", description: "Anda harus menyetujui disclaimer", variant: "destructive" });
            return;
          }
        }
      }
    }
    
    if (currentStep === 2) {
      if (!values.fullName || !values.phoneNumber || !values.province || !values.city || !values.fcMobileNickname || !values.ovr) {
        toast({ title: "Perhatian", description: "Lengkapi semua data diri", variant: "destructive" });
        return;
      }
    }

    if (currentStep === 3) {
      if (!values.canScore30) {
        toast({ title: "Perhatian", description: "Pilih salah satu jawaban", variant: "destructive" });
        return;
      }
    }
    
    if (currentStep === 4) {
      if (!values.socialTikTok || !values.socialInstagram || !values.socialYouTube || !values.socialWhatsappChannel) {
        toast({ title: "Perhatian", description: "Anda wajib mengunjungi semua sosial media kami", variant: "destructive" });
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await submitOnboarding({ ...values, status: "accepted" });
      if (res.success) {
        clearDraft();
        setIsSuccess(true);
      } else {
        toast({ title: "Error", description: res.error || "Terjadi kesalahan", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Gagal memproses pendaftaran", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rejectionReason) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "mx-auto max-w-lg rounded-3xl p-8 text-center shadow-xl",
          embedded ? "bg-white" : "glass-panel"
        )}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="mb-4 text-3xl font-extrabold text-foreground">Pendaftaran Ditolak</h2>
        <p className="mb-8 text-lg text-muted-foreground">{rejectionReason}</p>
        <Button onClick={handleCancel} className="w-full rounded-xl px-8 py-6 text-lg font-bold">
          Tutup
        </Button>
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative mx-auto max-w-lg overflow-hidden rounded-3xl border border-primary/20 p-10 text-center shadow-2xl",
          embedded ? "bg-white" : "glass-panel"
        )}
      >
        <div className="pointer-events-none absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner"
        >
          <CheckCircle2 className="h-12 w-12" />
        </motion.div>
        <h2 className="mb-4 text-4xl font-extrabold text-foreground">Selamat!</h2>
        <p className="mb-8 text-lg text-muted-foreground">
          Pendaftaran berhasil. Silakan bergabung ke WhatsApp Group untuk informasi lebih lanjut.
        </p>
        <Button
          asChild
          size="lg"
          className="w-full cursor-pointer rounded-xl px-8 py-6 text-lg font-bold"
        >
          <a
            href={whatsappGroupLink || "#"}
            target={whatsappGroupLink ? "_blank" : "_self"}
            rel="noreferrer"
          >
            Gabung WhatsApp Group
          </a>
        </Button>
      </motion.div>
    );
  }

  const age = values.birthDate ? differenceInYears(new Date(), values.birthDate) : null;
  const showParentQuestions = age !== null && age < 15;

  return (
    <div
      className={cn(
        "relative mx-auto max-w-3xl overflow-hidden",
        embedded
          ? "rounded-2xl bg-white p-1 md:p-2"
          : "glass-panel rounded-3xl bg-card p-6 shadow-xl md:p-10"
      )}
    >
      <div className={cn("mb-8", embedded && "mb-6")}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            {STEPS[currentStep - 1]?.icon}
            <span className="text-lg font-bold">Langkah {currentStep} dari 5</span>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            {STEPS[currentStep - 1]?.title}
          </span>
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2.5 bg-secondary" />
      </div>

      <div className={cn(embedded ? "min-h-[280px]" : "min-h-[400px]")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.1 }}
          >
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-extrabold mb-3 text-foreground tracking-tight">Kapan Anda Lahir?</h3>
                  <p className="text-muted-foreground text-md mb-8">Kami perlu memastikan Anda memenuhi syarat umur minimum untuk bergabung.</p>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex items-center justify-start whitespace-nowrap font-normal h-14 bg-background border border-border text-md shadow-sm rounded-xl hover:bg-muted px-4 w-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                        !values.birthDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-5 w-5" />
                      {values.birthDate ? format(values.birthDate, "dd MMMM yyyy", { locale: id }) : <span>Pilih tanggal</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={values.birthDate}
                        onSelect={(date) => {
                          setValue("birthDate", date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                        initialFocus
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

              {showParentQuestions && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-6 border-t border-border">
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                    <Label className="mb-4 block text-lg font-bold text-foreground">Apakah handphone yang digunakan saat ini merupakan:</Label>
                    <RadioGroup onValueChange={(val) => setValue("phoneOwner", val)} value={values.phoneOwner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <RadioGroupItem value="sendiri" id="p-sendiri" className="sr-only" />
                        <Label htmlFor="p-sendiri" className="flex items-center space-x-3 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary/10 group-has-checked:border-primary shadow-sm">
                          <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                            {values.phoneOwner === "sendiri" && <div className="h-2.5 w-2.5 bg-primary rounded-full" />}
                          </div>
                          <span className="flex-1 font-medium text-md">Milik saya sendiri</span>
                        </Label>
                      </div>
                      <div className="relative group">
                        <RadioGroupItem value="orang_tua" id="p-ortu" className="sr-only" />
                        <Label htmlFor="p-ortu" className="flex items-center space-x-3 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary/10 group-has-checked:border-primary shadow-sm">
                          <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                            {values.phoneOwner === "orang_tua" && <div className="h-2.5 w-2.5 bg-primary rounded-full" />}
                          </div>
                          <span className="flex-1 font-medium text-md">Milik orang tua</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {values.phoneOwner === "sendiri" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <Label className="mb-4 block text-lg font-bold text-foreground">Apakah handphone Anda sering diperiksa atau masih dikontrol oleh orang tua?</Label>
                      <RadioGroup onValueChange={(val) => setValue("phoneChecked", val)} value={values.phoneChecked} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative group">
                          <RadioGroupItem value="ya" id="c-ya" className="sr-only" />
                          <Label htmlFor="c-ya" className="flex items-center space-x-3 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary/10 group-has-checked:border-primary shadow-sm">
                            <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                              {values.phoneChecked === "ya" && <div className="h-2.5 w-2.5 bg-primary rounded-full" />}
                            </div>
                            <span className="flex-1 font-medium text-md">Ya</span>
                          </Label>
                        </div>
                        <div className="relative group">
                          <RadioGroupItem value="tidak" id="c-tidak" className="sr-only" />
                          <Label htmlFor="c-tidak" className="flex items-center space-x-3 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary/10 group-has-checked:border-primary shadow-sm">
                            <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                              {values.phoneChecked === "tidak" && <div className="h-2.5 w-2.5 bg-primary rounded-full" />}
                            </div>
                            <span className="flex-1 font-medium text-md">Tidak</span>
                          </Label>
                        </div>
                        <div className="relative group">
                          <RadioGroupItem value="terkadang" id="c-terkadang" className="sr-only" />
                          <Label htmlFor="c-terkadang" className="flex items-center space-x-3 bg-background p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary/10 group-has-checked:border-primary shadow-sm">
                            <div className="h-5 w-5 rounded-full border border-primary flex items-center justify-center">
                              {values.phoneChecked === "terkadang" && <div className="h-2.5 w-2.5 bg-primary rounded-full" />}
                            </div>
                            <span className="flex-1 font-medium text-md">Terkadang</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  )}

                  {values.phoneOwner === "sendiri" && values.phoneChecked === "terkadang" && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-yellow-500/10 border border-yellow-500/20 p-5 rounded-2xl mt-4 text-yellow-800 dark:text-yellow-200">
                      <p className="text-sm mb-4 leading-relaxed font-medium">
                        {disclaimerText}
                      </p>
                      <Label htmlFor="warning" className="flex items-center space-x-3 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-yellow-500/10 transition-colors">
                        <Checkbox 
                          id="warning" 
                          checked={values.warningAccept} 
                          onCheckedChange={(val) => setValue("warningAccept", val)}
                          className="h-6 w-6 border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white"
                        />
                        <span className="text-md font-bold">Saya memahami dan menyetujui.</span>
                      </Label>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-3xl font-extrabold mb-8 text-foreground tracking-tight">Data Diri & In-Game</h3>
              
              <div className="space-y-3">
                <Label className="font-semibold text-muted-foreground">Nama Lengkap</Label>
                <Input className="h-14 bg-background border-border rounded-xl text-md shadow-sm" placeholder="Masukkan nama lengkap Anda" value={values.fullName || ""} onChange={(e) => setValue("fullName", e.target.value)} />
              </div>
              
              <div className="space-y-3">
                <Label className="font-semibold text-muted-foreground">No Telepon (WhatsApp)</Label>
                <Input className="h-14 bg-background border-border rounded-xl text-md shadow-sm" placeholder="Contoh: 081234567890" value={values.phoneNumber || ""} onChange={(e) => setValue("phoneNumber", e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="font-semibold text-muted-foreground">Provinsi</Label>
                  <SearchableSelect 
                    value={values.province || ""} 
                    onChange={(val) => {
                      setValue("province", val);
                      setValue("city", "");
                    }}
                    options={regions.map((p) => p.name)}
                    placeholder="Pilih Provinsi"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold text-muted-foreground">Kota / Kabupaten</Label>
                  <SearchableSelect 
                    value={values.city || ""} 
                    onChange={(val) => setValue("city", val)}
                    options={values.province ? regions.find(p => p.name === values.province)?.cities || [] : []}
                    disabled={!values.province}
                    placeholder="Pilih Kota / Kabupaten"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border">
                <div className="md:col-span-2 space-y-3">
                  <Label className="font-semibold text-muted-foreground">Nickname FC Mobile</Label>
                  <Input className="h-14 bg-background border-border rounded-xl text-md shadow-sm" placeholder="Nickname in-game" value={values.fcMobileNickname || ""} onChange={(e) => setValue("fcMobileNickname", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label className="font-semibold text-muted-foreground">OVR</Label>
                  <Input type="number" className="h-14 bg-background border-border rounded-xl text-md shadow-sm" placeholder="Misal: 105" value={values.ovr || ""} onChange={(e) => setValue("ovr", parseInt(e.target.value) || "")} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <h3 className="text-3xl font-extrabold mb-3 text-foreground tracking-tight">Kemampuan Bermain</h3>
              <p className="text-muted-foreground text-md mb-8">Jawab dengan jujur untuk memudahkan penempatan divisi Anda di komunitas.</p>
              
              <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                <Label className="text-xl font-bold leading-relaxed mb-8 block text-center text-foreground">Apakah Anda mampu bermain VSA / Head to Head dengan rata-rata lebih dari 30 gol?</Label>
                <RadioGroup onValueChange={(val) => setValue("canScore30", val)} value={values.canScore30} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                    <RadioGroupItem value="ya" id="score-ya" className="sr-only" />
                    <Label htmlFor="score-ya" className="flex h-32 items-center justify-center bg-background rounded-2xl border-2 border-border cursor-pointer hover:border-primary/50 transition-all group-has-checked:bg-primary group-has-checked:border-primary shadow-sm w-full">
                      <span className="font-extrabold text-3xl group-has-checked:text-white text-foreground">YA</span>
                    </Label>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative group">
                    <RadioGroupItem value="tidak" id="score-tidak" className="sr-only" />
                    <Label htmlFor="score-tidak" className="flex h-32 items-center justify-center bg-background rounded-2xl border-2 border-border cursor-pointer hover:border-destructive/50 transition-all group-has-checked:bg-destructive group-has-checked:border-destructive shadow-sm w-full">
                      <span className="font-extrabold text-3xl group-has-checked:text-white text-foreground">TIDAK</span>
                    </Label>
                  </motion.div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-8">
              <h3 className="text-3xl font-extrabold mb-3 text-foreground tracking-tight">Persyaratan Bergabung</h3>
              <p className="text-muted-foreground text-md mb-8">{joinRequirementsText}</p>
              
              <div className="space-y-5">
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Button 
                    asChild
                    variant={values.socialTikTok ? "outline" : "default"}
                    className={cn("w-full h-16 justify-between rounded-2xl text-lg shadow-sm border-2 cursor-pointer transition-all", values.socialTikTok ? "bg-background border-green-500 text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <a 
                      href={tiktokLink || "#"} 
                      target={tiktokLink ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      onClick={() => handleVisitSocial("socialTikTok")}
                    >
                      <span className="flex items-center"><span className="font-bold">Follow TikTok</span></span>
                      {values.socialTikTok ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : "Kunjungi"}
                    </a>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <Button 
                    asChild
                    variant={values.socialInstagram ? "outline" : "default"}
                    className={cn("w-full h-16 justify-between rounded-2xl text-lg shadow-sm border-2 cursor-pointer transition-all", values.socialInstagram ? "bg-background border-green-500 text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <a 
                      href={instagramLink || "#"} 
                      target={instagramLink ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      onClick={() => handleVisitSocial("socialInstagram")}
                    >
                      <span className="flex items-center"><span className="font-bold">Follow Instagram</span></span>
                      {values.socialInstagram ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : "Kunjungi"}
                    </a>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <Button 
                    asChild
                    variant={values.socialYouTube ? "outline" : "default"}
                    className={cn("w-full h-16 justify-between rounded-2xl text-lg shadow-sm border-2 cursor-pointer transition-all", values.socialYouTube ? "bg-background border-green-500 text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <a 
                      href={youtubeLink || "#"} 
                      target={youtubeLink ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      onClick={() => handleVisitSocial("socialYouTube")}
                    >
                      <span className="flex items-center"><span className="font-bold">Subscribe YouTube</span></span>
                      {values.socialYouTube ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : "Kunjungi"}
                    </a>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }}>
                  <Button 
                    asChild
                    variant={values.socialWhatsappChannel ? "outline" : "default"}
                    className={cn("w-full h-16 justify-between rounded-2xl text-lg shadow-sm border-2 cursor-pointer transition-all", values.socialWhatsappChannel ? "bg-background border-green-500 text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90")}
                  >
                    <a 
                      href={whatsappChannelLink || "#"} 
                      target={whatsappChannelLink ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      onClick={() => handleVisitSocial("socialWhatsappChannel")}
                    >
                      <span className="flex items-center"><span className="font-bold">Join Saluran WhatsApp</span></span>
                      {values.socialWhatsappChannel ? <CheckCircle2 className="h-7 w-7 text-green-500" /> : "Kunjungi"}
                    </a>
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <h3 className="text-3xl font-extrabold mb-3 text-foreground tracking-tight">Review Data</h3>
              <p className="text-muted-foreground text-md mb-8">Pastikan seluruh data pendaftaran Anda sudah akurat sebelum mengirimkannya.</p>
              
              <div className="bg-background border border-border shadow-sm rounded-3xl p-8 space-y-6 text-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center border-b border-border pb-4">
                  <span className="text-muted-foreground font-semibold">Nama Lengkap</span>
                  <span className="sm:col-span-2 font-bold text-lg text-foreground">{values.fullName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center border-b border-border pb-4">
                  <span className="text-muted-foreground font-semibold">No Telepon</span>
                  <span className="sm:col-span-2 font-bold text-lg text-foreground">{values.phoneNumber}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center border-b border-border pb-4">
                  <span className="text-muted-foreground font-semibold">Tanggal Lahir & Umur</span>
                  <span className="sm:col-span-2 font-bold text-lg text-foreground">
                    {values.birthDate ? `${format(values.birthDate, "dd MMMM yyyy", { locale: id })} (${age} Tahun)` : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center border-b border-border pb-4">
                  <span className="text-muted-foreground font-semibold">Domisili</span>
                  <span className="sm:col-span-2 font-bold text-lg text-foreground">{values.city}, {values.province}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center">
                  <span className="text-muted-foreground font-semibold">Akun Game</span>
                  <span className="sm:col-span-2 font-bold text-lg text-foreground bg-primary/10 text-primary px-4 py-2 rounded-xl inline-block w-fit">
                    {values.fcMobileNickname} <span className="opacity-70 mx-1">|</span> OVR {values.ovr}
                  </span>
                </div>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        {currentStep > 1 ? (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={isSubmitting}
            className="rounded-xl text-md font-bold hover:bg-muted"
          >
            Kembali
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleCancel}
            className="rounded-xl text-md font-bold text-muted-foreground hover:text-foreground"
          >
            Batal
          </Button>
        )}

        {currentStep < 5 ? (
          <Button size="lg" onClick={handleNext} className="rounded-xl px-10 text-md font-bold">
            Lanjut
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-xl px-10 text-md font-bold"
          >
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Kirim Pendaftaran
          </Button>
        )}
      </div>
    </div>
  );
}
