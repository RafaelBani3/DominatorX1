"use server";

import { prisma } from "@/lib/prisma";
import { assertAdminSession } from "@/lib/admin-auth";

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayLabel(date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export async function getDashboardStats() {
  await assertAdminSession();

  const now = new Date();
  const todayStart = startOfDay(now);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const trendStart = startOfDay(new Date(now));
  trendStart.setDate(trendStart.getDate() - 13);

  const [
    totalMembers,
    todayMembers,
    weekMembers,
    monthMembers,
    rejectedMembers,
    pendingMembers,
    acceptedMembers,
    trendMembers,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: { status: "accepted", joinDate: { gte: todayStart } },
    }),
    prisma.member.count({
      where: { status: "accepted", joinDate: { gte: startOfWeek } },
    }),
    prisma.member.count({
      where: { status: "accepted", joinDate: { gte: startOfMonth } },
    }),
    prisma.member.count({ where: { status: "rejected" } }),
    prisma.member.count({ where: { status: "pending" } }),
    prisma.member.findMany({
      where: { status: "accepted" },
      select: { birthDate: true, province: true, ovr: true, city: true },
    }),
    prisma.member.findMany({
      where: { joinDate: { gte: trendStart } },
      select: { joinDate: true, status: true },
      orderBy: { joinDate: "asc" },
    }),
  ]);

  const acceptedCount = acceptedMembers.length;

  let averageOvr = 0;
  if (acceptedCount > 0) {
    averageOvr =
      acceptedMembers.reduce((acc, m) => acc + (m.ovr || 0), 0) / acceptedCount;
  }

  const provinceData = {};
  const ageData = { "<15": 0, "15-18": 0, "19-24": 0, ">24": 0 };
  const ovrData = {
    "<90": 0,
    "90-99": 0,
    "100-109": 0,
    "110-119": 0,
    "120+": 0,
  };

  acceptedMembers.forEach((m) => {
    let province = m.province?.trim() || "Lainnya";
    if (province !== "Lainnya") {
      // Normalize to Title Case
      province = province.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
      
      // Handle common abbreviations/aliases
      const p = province.toLowerCase();
      if (p === "jabar") province = "Jawa Barat";
      else if (p === "jatim") province = "Jawa Timur";
      else if (p === "jateng") province = "Jawa Tengah";
      else if (p === "sulsel") province = "Sulawesi Selatan";
      else if (p === "sultra") province = "Sulawesi Tenggara";
      else if (p === "sulut") province = "Sulawesi Utara";
      else if (p === "sulteng") province = "Sulawesi Tengah";
      else if (p === "kalsel") province = "Kalimantan Selatan";
      else if (p === "kaltim") province = "Kalimantan Timur";
      else if (p === "kalbar") province = "Kalimantan Barat";
      else if (p === "kalteng") province = "Kalimantan Tengah";
      else if (p === "kaltara") province = "Kalimantan Utara";
      else if (p === "sumut") province = "Sumatera Utara";
      else if (p === "sumsel") province = "Sumatera Selatan";
      else if (p === "sumbar") province = "Sumatera Barat";
      else if (p.includes("jakarta")) province = "DKI Jakarta";
      else if (p.includes("yogyakarta") || p === "diy") province = "DI Yogyakarta";
    }
    provinceData[province] = (provinceData[province] || 0) + 1;

    const age = now.getFullYear() - new Date(m.birthDate).getFullYear();
    if (age < 15) ageData["<15"]++;
    else if (age <= 18) ageData["15-18"]++;
    else if (age <= 24) ageData["19-24"]++;
    else ageData[">24"]++;

    const ovr = m.ovr || 0;
    if (ovr < 90) ovrData["<90"]++;
    else if (ovr < 100) ovrData["90-99"]++;
    else if (ovr < 110) ovrData["100-109"]++;
    else if (ovr < 120) ovrData["110-119"]++;
    else ovrData["120+"]++;
  });

  const provinceChart = Object.entries(provinceData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const ageChart = Object.entries(ageData).map(([name, value]) => ({
    name,
    value,
  }));

  const ovrChart = Object.entries(ovrData).map(([name, value]) => ({
    name,
    value,
  }));

  const decided = acceptedCount + rejectedMembers;
  const conversionRate =
    decided > 0 ? Math.round((acceptedCount / decided) * 100) : 0;

  const statusChart = [
    { name: "Diterima", value: acceptedCount, key: "accepted" },
    { name: "Ditolak", value: rejectedMembers, key: "rejected" },
    { name: "Pending", value: pendingMembers, key: "pending" },
  ];

  const dayBuckets = {};
  for (let i = 13; i >= 0; i--) {
    const d = startOfDay(new Date(now));
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets[key] = {
      date: key,
      label: formatDayLabel(d),
      accepted: 0,
      rejected: 0,
      pending: 0,
      total: 0,
    };
  }

  trendMembers.forEach((m) => {
    const key = startOfDay(new Date(m.joinDate)).toISOString().slice(0, 10);
    if (!dayBuckets[key]) return;
    dayBuckets[key].total += 1;
    if (m.status === "accepted") dayBuckets[key].accepted += 1;
    else if (m.status === "rejected") dayBuckets[key].rejected += 1;
    else dayBuckets[key].pending += 1;
  });

  const joinTrend = Object.values(dayBuckets);

  return {
    totalMembers,
    acceptedMembers: acceptedCount,
    todayMembers,
    weekMembers,
    monthMembers,
    rejectedMembers,
    pendingMembers,
    averageOvr: Math.round(averageOvr),
    conversionRate,
    provinceChart,
    ageChart,
    ovrChart,
    statusChart,
    joinTrend,
  };
}
