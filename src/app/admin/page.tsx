import { createAdminClient } from "@/lib/supabase/server";
import { Users, HardDrive, Files, Mail, Shield } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, role, storage_used, storage_quota, is_blocked, created_at");

  const { count: totalFiles } = await supabase
    .from("files")
    .select("id", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: allowedCount } = await supabase
    .from("allowed_emails")
    .select("id", { count: "exact", head: true });

  const users = profiles ?? [];
  const totalUsers = users.length;
  const blockedUsers = users.filter(u => u.is_blocked).length;
  const adminUsers = users.filter(u => u.role === "admin").length;
  const totalStorage = users.reduce((s, u) => s + (u.storage_used ?? 0), 0);

  const recent = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const topStorage = [...users]
    .sort((a, b) => (b.storage_used ?? 0) - (a.storage_used ?? 0))
    .slice(0, 5);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "#6366f1",
      sub: `${adminUsers} admin · ${blockedUsers} blocked`,
    },
    {
      label: "Total Files",
      value: totalFiles ?? 0,
      icon: Files,
      color: "#22c55e",
      sub: "across all users",
    },
    {
      label: "Storage Used",
      value: formatBytes(totalStorage),
      icon: HardDrive,
      color: "#f59e0b",
      sub: "combined usage",
    },
    {
      label: "Allowed Emails",
      value: allowedCount ?? 0,
      icon: Mail,
      color: "#ec4899",
      sub: "whitelist entries",
    },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-400" />
          Admin Overview
        </h1>
        <p className="text-slate-600 text-sm mt-0.5">System-wide statistics and controls</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className="glass rounded-2xl p-4 sm:p-5 border border-white/[0.05]"
            style={{ boxShadow: `0 0 30px ${color}08` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs text-slate-600 font-medium uppercase tracking-wide leading-tight">
                {label}
              </span>
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color }} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-display font-bold text-white">{value}</div>
            <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-400" />
            Recent Signups
          </h3>
          <div className="space-y-2">
            {recent.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No users yet</p>
            )}
            {recent.map(u => (
              <div key={u.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-300 text-xs font-bold flex-shrink-0">
                  {(u.email?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate">{u.email}</p>
                  <p className="text-[10px] text-slate-600">
                    {new Date(u.created_at).toLocaleDateString()}
                  </p>
                </div>
                {u.role === "admin" && (
                  <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    ADMIN
                  </span>
                )}
                {u.is_blocked && (
                  <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    BLOCKED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-yellow-400" />
            Top Storage Users
          </h3>
          <div className="space-y-3">
            {topStorage.length === 0 && (
              <p className="text-slate-600 text-sm text-center py-4">No data yet</p>
            )}
            {topStorage.map(u => {
              const pct = Math.min(((u.storage_used ?? 0) / (u.storage_quota ?? 1073741824)) * 100, 100);
              return (
                <div key={u.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400 truncate max-w-[60%]">{u.email}</span>
                    <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                      {formatBytes(u.storage_used ?? 0)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: pct > 80
                          ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                          : "linear-gradient(90deg,#6366f1,#818cf8)",
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 mt-0.5">{pct.toFixed(1)}% of {formatBytes(u.storage_quota ?? 1073741824)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
