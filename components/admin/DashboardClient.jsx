"use client";

import Link from "next/link";
import {
  Users,
  UserPlus,
  UserX,
  Percent,
  MapPin,
  Gauge,
  TrendingUp,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const PURPLE = "#7C5CFC";
const PINK = "#FF6B9D";
const GREEN = "#22C55E";
const ORANGE = "#F59E0B";
const BLUE = "#3B82F6";

const STATUS_COLORS = {
  accepted: GREEN,
  rejected: "#EF4444",
  pending: ORANGE,
};

const CHART_COLORS = [PURPLE, "#9B84FF", "#B8A6FF", PINK, BLUE, ORANGE];

function SoftCard({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white bg-white p-5 shadow-[0_12px_40px_rgba(124,92,252,0.08)] sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

function KpiCard({ title, value, hint, icon: Icon, iconBg, delta, deltaPositive = true }) {
  return (
    <SoftCard className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight text-[#1F2430]">{value}</p>
          <p className="mt-1 text-sm font-medium text-[#8A93A6]">{title}</p>
          {hint ? <p className="mt-2 text-xs text-[#A0A8B8]">{hint}</p> : null}
          {delta ? (
            <p
              className={cn(
                "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
                deltaPositive ? "text-emerald-500" : "text-rose-500"
              )}
            >
              <ArrowUpRight className={cn("h-3.5 w-3.5", !deltaPositive && "rotate-90")} />
              {delta}
            </p>
          ) : null}
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </SoftCard>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-[#EEE8FF] bg-white px-3 py-2 text-xs shadow-xl">
      {label ? <p className="mb-1 font-semibold text-[#1F2430]">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.dataKey} className="text-[#8A93A6]">
          <span className="font-medium text-[#1F2430]">{item.name}</span>: {item.value}
        </p>
      ))}
    </div>
  );
}

export default function DashboardClient({ stats }) {
  const { data: session } = authClient.useSession();
  const statusTotal = (stats.statusChart || []).reduce((a, b) => a + b.value, 0);
  const trendTotal = (stats.joinTrend || []).reduce((a, b) => a + b.total, 0);
  const userName = session?.user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1F2430] md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#8A93A6]">
            Hi, {userName}! Welcome to Dominator XI Dashboard.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-[#6B7285] shadow-[0_8px_24px_rgba(124,92,252,0.06)]">
            14 hari terakhir
          </div>
          <Button
            asChild
            className="h-11 rounded-2xl bg-[#7C5CFC] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(124,92,252,0.35)] hover:bg-[#6B4CEB]"
          >
            <Link href="/admin/members">
              <Plus className="mr-1.5 h-4 w-4" />
              Kelola Member
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
          <KpiCard
            title="Total Member Aktif"
            value={stats.acceptedMembers ?? stats.totalMembers}
            hint={`OVR rata-rata ${stats.averageOvr}`}
            icon={Users}
            iconBg={PURPLE}
            delta={`${stats.weekMembers} minggu ini`}
          />
          <KpiCard
            title="Member Baru Bulan Ini"
            value={stats.monthMembers}
            hint={`Hari ini ${stats.todayMembers}`}
            icon={UserPlus}
            iconBg={GREEN}
            delta={`${stats.weekMembers} minggu ini`}
          />
          <KpiCard
            title="Member Ditolak"
            value={stats.rejectedMembers}
            hint={`Pending ${stats.pendingMembers ?? 0}`}
            icon={UserX}
            iconBg="#EF4444"
            delta={`${stats.pendingMembers ?? 0} menunggu review`}
            deltaPositive={false}
          />
          <KpiCard
            title="Acceptance Rate"
            value={`${stats.conversionRate ?? 0}%`}
            hint="Diterima vs keputusan final"
            icon={Percent}
            iconBg={ORANGE}
            delta="Konversi pendaftaran"
          />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <SoftCard className="xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2430]">
                <TrendingUp className="h-5 w-5 text-[#7C5CFC]" />
                Community Performance
              </h3>
              <p className="mt-1 text-sm text-[#8A93A6]">
                Total {trendTotal} pendaftar dalam 14 hari terakhir
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-[#8A93A6]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7C5CFC]" /> Diterima
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#8A93A6]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B9D]" /> Ditolak
              </span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.joinTrend || []} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillPerfAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPerfRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PINK} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={PINK} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF1F7" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9AA3B5", fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9AA3B5", fontSize: 11 }}
                  width={28}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  name="Diterima"
                  stroke={PURPLE}
                  fill="url(#fillPerfAccepted)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  name="Ditolak"
                  stroke={PINK}
                  fill="url(#fillPerfRejected)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>

        <SoftCard className="xl:col-span-4">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-[#1F2430]">Status Overview</h3>
            <p className="mt-1 text-sm text-[#8A93A6]">Komposisi seluruh pendaftaran</p>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusChart || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={84}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {(stats.statusChart || []).map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] || "#94a3b8"} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 26, fontWeight: 700, fill: "#1F2430" }}
                >
                  {statusTotal}
                </text>
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: 11, fill: "#8A93A6" }}
                >
                  Total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 space-y-2">
            {(stats.statusChart || []).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-2xl bg-[#F7F8FC] px-3 py-2.5 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-[#6B7285]">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[item.key] }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-[#1F2430]">{item.value}</span>
              </div>
            ))}
          </div>
        </SoftCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-3">
        <SoftCard>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2430]">
              <MapPin className="h-5 w-5 text-[#7C5CFC]" />
              Top Provinsi
            </h3>
            <p className="mt-1 text-sm text-[#8A93A6]">Lokasi member aktif terbanyak</p>
          </div>
          <div className="h-[260px]">
            {(stats.provinceChart || []).length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-[#8A93A6]">
                Belum ada data provinsi
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats.provinceChart || []}
                  margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#EEF1F7" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#9AA3B5", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#6B7285", fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,92,252,0.06)" }} />
                  <Bar dataKey="value" name="Member" radius={[0, 12, 12, 0]} maxBarSize={18}>
                    {(stats.provinceChart || []).map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SoftCard>

        <SoftCard>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2430]">
              <Users className="h-5 w-5 text-[#7C5CFC]" />
              Demografi Umur
            </h3>
            <p className="mt-1 text-sm text-[#8A93A6]">Sebaran usia member aktif</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageChart || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF1F7" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#9AA3B5", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#9AA3B5", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,92,252,0.06)" }} />
                <Bar dataKey="value" name="Member" radius={[12, 12, 12, 12]} fill={PURPLE} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>

        <SoftCard>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-[#1F2430]">
              <Gauge className="h-5 w-5 text-[#7C5CFC]" />
              Distribusi OVR
            </h3>
            <p className="mt-1 text-sm text-[#8A93A6]">Kekuatan squad berdasarkan OVR</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ovrChart || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#EEF1F7" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#9AA3B5", fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#9AA3B5", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,92,252,0.06)" }} />
                <Bar dataKey="value" name="Member" radius={[12, 12, 12, 12]} maxBarSize={32}>
                  {(stats.ovrChart || []).map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>
      </div>
    </div>
  );
}
