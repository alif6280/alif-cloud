"use client";
import { useEffect, useState } from "react";
import { BarChart2, HardDrive, Files, Download, TrendingUp, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { createClient } from "@/lib/supabase/client";
import { formatBytes } from "@/lib/utils";
import type { StorageFile, Profile } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  pdf: "#ef4444", image: "#22c55e", video: "#a855f7",
  doc: "#3b82f6", audio: "#f59e0b", archive: "#f97316", other: "#64748b",
};

export default function AnalyticsPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const [{ data: f }, { data: p }] = await Promise.all([
        supabase.from("files").select("*").eq("user_id", user!.id).eq("is_deleted", false),
        supabase.from("profiles").select("*").eq("id", user!.id).single(),
      ]);
      setFiles((f ?? []) as StorageFile[]);
      setProfile(p as Profile);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  );

  // File type breakdown
  const typeCounts = files.reduce((acc, f) => {
    acc[f.file_type] = (acc[f.file_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Upload by day (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const count = files.filter(f => {
      const fd = new Date(f.created_at);
      return fd.toDateString() === d.toDateString();
    }).length;
    return { label, count };
  });

  const totalDownloads = files.reduce((s, f) => s + (f.download_count || 0), 0);
  const used = profile?.storage_used ?? 0;
  const quota = profile?.storage_quota ?? 1073741824;
  const pct = Math.min((used / quota) * 100, 100);

  const statCards = [
    { icon: Files, label: "Total Files", value: files.length, color: "#6366f1" },
    { icon: HardDrive, label: "Storage Used", value: formatBytes(used), color: "#22d3ee" },
    { icon: Download, label: "Total Downloads", value: totalDownloads, color: "#22c55e" },
    { icon: TrendingUp, label: "This Week", value: last7.reduce((s, d) => s + d.count, 0) + " files", color: "#f59e0b" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brand-400" /> Analytics
        </h1>
        <p className="text-slate-600 text-sm mt-0.5">Your storage insights</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="stat-card" style={{ ["--glow" as string]: color }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-600 font-medium uppercase tracking-wide">{label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-display font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <h3 className="text-sm font-display font-semibold text-white mb-4">Uploads — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }} cursor={{ fill: "rgba(99,102,241,0.05)" }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <h3 className="text-sm font-display font-semibold text-white mb-4">File Type Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-slate-600 text-sm">No files yet</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, color: "#f1f5f9", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map(e => (
                  <div key={e.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: TYPE_COLORS[e.name] }} />
                    <span className="text-xs text-slate-400 capitalize flex-1">{e.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Storage gauge */}
      <div className="glass rounded-2xl p-5 border border-white/[0.05]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-display font-semibold text-white">Storage Usage</h3>
          <span className="text-xs text-slate-500">{pct.toFixed(1)}% used</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{
            width: `${pct}%`,
            background: pct > 80 ? "linear-gradient(90deg,#f59e0b,#ef4444)" : "linear-gradient(90deg,#6366f1,#818cf8,#a78bfa)"
          }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-600">
          <span>{formatBytes(used)} used</span>
          <span>{formatBytes(quota - used)} free</span>
          <span>{formatBytes(quota)} total</span>
        </div>
      </div>
    </div>
  );
}
