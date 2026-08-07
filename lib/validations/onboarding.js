import { z } from "zod";

export const onboardingSchema = z.object({
  birthDate: z.date({
    required_error: "Tanggal lahir wajib diisi.",
  }),
  // For under 15
  phoneOwner: z.enum(["sendiri", "orang_tua"]).optional().or(z.literal("")),
  phoneChecked: z.enum(["ya", "tidak", "terkadang"]).optional().or(z.literal("")),
  warningAccept: z.boolean().default(false),
  
  // Step 2
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter."),
  province: z.string().min(1, "Provinsi wajib diisi."),
  city: z.string().min(1, "Kota wajib diisi."),
  fcMobileNickname: z.string().min(3, "Nickname wajib diisi."),
  ovr: z.number().min(50, "OVR minimal 50.").max(150, "OVR maksimal 150."),
  
  // Step 3
  canScore30: z.enum(["ya", "tidak"]).optional().or(z.literal("")),
  
  // Step 4
  socialTikTok: z.boolean().default(false),
  socialInstagram: z.boolean().default(false),
  socialYouTube: z.boolean().default(false),
});
