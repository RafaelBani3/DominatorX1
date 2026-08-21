import { z } from "zod";

export const tournamentCreateSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  description: z.string().optional().nullable(),
  bracketType: z.enum(["single", "double"]),
  maxParticipants: z.coerce.number().int().min(2).max(128).default(16),
});

export const tournamentRegisterSchema = z.object({
  tournamentId: z.string().min(1),
  nickname: z
    .string()
    .min(2, "Nickname minimal 2 karakter")
    .max(32, "Nickname maksimal 32 karakter")
    .regex(/^[\w.\- ]+$/u, "Nickname hanya huruf, angka, spasi, titik, strip"),
  phoneNumber: z
    .string()
    .min(10, "No HP minimal 10 digit")
    .max(15, "No HP maksimal 15 digit")
    .regex(/^[0-9+]+$/, "No HP hanya angka"),
  displayName: z.string().max(64).optional().nullable(),
});
