"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";

export async function getSettings() {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
}

export async function updateSettings(data) {
  try {
    await assertAdminSession();
    const promises = Object.entries(data).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(promises);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
