"use server";

import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";

export async function getDashboardStats() {
  await assertAdminSession();

  const now = new Date();

  const totalMembers = await prisma.member.count({ where: { status: "accepted" } });

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayMembers = await prisma.member.count({
    where: { status: "accepted", joinDate: { gte: startOfDay } },
  });

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weekMembers = await prisma.member.count({
    where: { status: "accepted", joinDate: { gte: startOfWeek } },
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthMembers = await prisma.member.count({
    where: { status: "accepted", joinDate: { gte: startOfMonth } },
  });

  const rejectedMembers = await prisma.member.count({ where: { status: "rejected" } });

  const members = await prisma.member.findMany({
    select: { birthDate: true, province: true, ovr: true },
    where: { status: "accepted" },
  });

  let averageOvr = 0;
  if (members.length > 0) {
    averageOvr = members.reduce((acc, m) => acc + m.ovr, 0) / members.length;
  }

  const provinceData = {};
  const ageData = { "<15": 0, "15-18": 0, "19-24": 0, ">24": 0 };

  members.forEach((m) => {
    provinceData[m.province] = (provinceData[m.province] || 0) + 1;

    const age = new Date().getFullYear() - m.birthDate.getFullYear();
    if (age < 15) ageData["<15"]++;
    else if (age <= 18) ageData["15-18"]++;
    else if (age <= 24) ageData["19-24"]++;
    else ageData[">24"]++;
  });

  const provinceChart = Object.entries(provinceData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const ageChart = Object.entries(ageData).map(([name, value]) => ({ name, value }));

  return {
    totalMembers,
    todayMembers,
    weekMembers,
    monthMembers,
    rejectedMembers,
    averageOvr: Math.round(averageOvr),
    provinceChart,
    ageChart,
  };
}
