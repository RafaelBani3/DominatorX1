"use server";

import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";

export async function getMembers(page = 1, limit = 10, search = "", filterStatus = "all") {
  await assertAdminSession();

  const where = {};

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { fcMobileNickname: { contains: search, mode: "insensitive" } },
      { province: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filterStatus !== "all") {
    where.status = filterStatus;
  }

  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { joinDate: "desc" },
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function updateMemberStatus(id, status, reason = null) {
  try {
    await assertAdminSession();
    await prisma.member.update({
      where: { id },
      data: { status, reason },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteMember(id) {
  try {
    await assertAdminSession();
    await prisma.member.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAllMembersForExport() {
  await assertAdminSession();
  return await prisma.member.findMany({
    orderBy: { joinDate: "desc" },
  });
}
