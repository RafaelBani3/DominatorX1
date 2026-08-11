"use server";

import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/onboarding";
export async function submitOnboarding(data) {
  try {
    const finalStatus = data.status || "pending";
    const reason = data.reason || null;
    
    // We parse and validate again on the server
    // If it's a rejection from step 1, use partial validation since other fields are missing
    let validData;
    if (finalStatus === "rejected") {
      validData = onboardingSchema.partial().parse(data);
    } else {
      validData = onboardingSchema.parse(data);
    }

    const member = await prisma.member.create({
      data: {
        fullName: validData.fullName || "Draft",
        phoneNumber: validData.phoneNumber || null,
        birthDate: validData.birthDate,
        province: validData.province || "",
        city: validData.city || "",
        fcMobileNickname: validData.fcMobileNickname || "",
        ovr: validData.ovr || 0,
        warningAccept: validData.warningAccept,
        status: finalStatus,
        reason: reason,
      },
    });

    // Save screening questions if age < 15
    if (validData.phoneOwner) {
      await prisma.screening.createMany({
        data: [
          {
            memberId: member.id,
            question: "Kepemilikan Handphone",
            answer: validData.phoneOwner,
          },
          {
            memberId: member.id,
            question: "Kontrol Orang Tua",
            answer: validData.phoneChecked || "tidak",
          }
        ]
      });
    }

    // Save gameplay screening question
    if (validData.canScore30) {
      await prisma.screening.create({
        data: {
          memberId: member.id,
          question: "Mampu bermain 30+ Gol?",
          answer: validData.canScore30,
        }
      });
    }

    return { success: true, memberId: member.id };
  } catch (error) {
    console.error("Onboarding Error:", error);
    return { success: false, error: error.message || "Gagal menyimpan data pendaftaran. Silakan coba lagi." };
  }
}
