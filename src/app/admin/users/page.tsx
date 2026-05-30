"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Users, Search, Shield, Ban, Trash2,
  Loader2, HardDrive, RefreshCw, CheckCircle, Edit2, Save, X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBytes } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  storage_used: number;
  storage_quota: number;
  is_blocked: boolean;
  blocked_reason: string | null;
  created_at: string;
  file_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingQuota, setEditingQuota] = useState<string | null>(null);
  const [quotaInput, setQuotaInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // API route দিয়ে সব users fetch করো (service role ব্যবহার করে)
  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setUsers(json.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function toggleBlock(user: AdminUser) {
    setActionLoading(user.id + "_block");
    const newBlocked = !user.is_blocked;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, action: newBlocked ? "block" : "unblock" }),
    });
    showToast(newBlocked ? `${user.email} blocked` : `${user.email} unblocked`);
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, is_blocked: newBlocked } : u
    ));
    setActionLoading(null);
  }

  async function toggleRole(user: AdminUser) {
    if (user.role === "admin") {
      const ok = confirm("Remove admin role from this user?");
      if (!ok) return;
    }
    setActionLoading(user.id + "_role");
    const newRole = user.role === "admin" ? "user" : "admin";
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, action: newRole === "admin" ? "make_admin" : "remove_admin" }),
    });
    showToast(`Role changed to ${newRole}`);
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, role: newRole as "user" | "admin" } : u
    ));
    setActionLoading(null);
  }

  async function deleteUser(user: AdminUser) {
    setActionLoading(user.id + "_delete");
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      showToast(`${user.email} deleted`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } else {
      showToast("Failed to delete user", "error");
    }
    setActionLoading(null);
    setConfirmDelete(null);
  }

  async function saveQuota(user: AdminUser) {
    const gb = parseFloat(quotaInput);
    if (isNaN(gb) || gb <= 0) {
      showToast("Enter a valid GB value", "error");
      return;
    }
    setActionLoading(user.id + "_quota");
    const bytes = Math.round(gb * 1073741824);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, action: "update_quota", quota: bytes }),
    });
    showToast(`Quota updated to ${gb} GB`);
    setUsers(prev => prev.map(u =>
      u.id === user.id ? { ...u, storage_quota: bytes } : u
    ));
    setEditingQuota(null);
    setActionLoading(null);
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-5 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Users
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white text-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="input-field py-2 text-sm w-full max-w-md"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-600">No users found</div>
          )}
          {filtered.map(user => {
            const pct = Math.min((user.storage_used / user.storage_quota) * 100, 100);
            const isDeleting = confirmDelete === user.id;
            const loading_id = actionLoading;

            return (
              <div
                key={user.id}
                className={`glass rounded-xl border transition-all ${
                  user.is_blocked
                    ? "border-orange-500/20 bg-orange-500/[0.02]"
                    : "border-white/[0.05] hover:border-white/[0.09]"
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        user.role === "admin"
                          ? "bg-red-500/20 border border-red-500/30 text-red-300"
                          : "bg-brand-600/20 border border-brand-500/30 text-brand-300"
                      }`}>
                        {(user.email[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {user.full_name || user.email.split("@")[0]}
                          </p>
                          {user.role === "admin" && (
                            <span className="text-[9px] font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                              ADMIN
                            </span>
                          )}
                          {user.is_blocked && (
                            <span className="text-[9px] font-mono text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md">
                              BLOCKED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">
                          Joined {new Date(user.created_at).toLocaleDateString()} ·{" "}
                          {user.file_count ?? 0} files
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => toggleRole(user)}
                        disabled={loading_id === user.id + "_role"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          user.role === "admin"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            : "bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.06]"
                        }`}
                      >
                        {loading_id === user.id + "_role"
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Shield className="w-3 h-3" />
                        }
                        <span className="hidden sm:inline">
                          {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleBlock(user)}
                        disabled={loading_id === user.id + "_block"}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          user.is_blocked
                            ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                            : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20"
                        }`}
                      >
                        {loading_id === user.id + "_block"
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : user.is_blocked
                            ? <CheckCircle className="w-3 h-3" />
                            : <Ban className="w-3 h-3" />
                        }
                        <span className="hidden sm:inline">
                          {user.is_blocked ? "Unblock" : "Block"}
                        </span>
                      </button>

                      {!isDeleting ? (
                        <button
                          onClick={() => setConfirmDelete(user.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-red-400">Sure?</span>
                          <button
                            onClick={() => deleteUser(user)}
                            disabled={loading_id === user.id + "_delete"}
                            className="px-2 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all"
                          >
                            {loading_id === user.id + "_delete"
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : "Yes"
                            }
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-2 py-1.5 rounded-lg text-xs bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06] transition-all"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/[0.04]">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        <span className="text-[10px] text-slate-500">Storage</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">
                          {formatBytes(user.storage_used)} / {formatBytes(user.storage_quota)}
                        </span>
                        {editingQuota === user.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={quotaInput}
                              onChange={e => setQuotaInput(e.target.value)}
                              placeholder="GB"
                              className="w-14 text-[10px] bg-white/[0.06] border border-white/[0.12] rounded-md px-1.5 py-0.5 text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => saveQuota(user)}
                              disabled={loading_id === user.id + "_quota"}
                              className="text-green-400 hover:text-green-300"
                            >
                              {loading_id === user.id + "_quota"
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Save className="w-3 h-3" />
                              }
                            </button>
                            <button
                              onClick={() => setEditingQuota(null)}
                              className="text-slate-500 hover:text-slate-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingQuota(user.id);
                              setQuotaInput((user.storage_quota / 1073741824).toFixed(1));
                            }}
                            className="text-slate-600 hover:text-slate-400 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct > 80
                            ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                            : user.is_blocked
                              ? "linear-gradient(90deg,#f97316,#fb923c)"
                              : "linear-gradient(90deg,#6366f1,#818cf8)",
                        }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-600 mt-0.5">{pct.toFixed(1)}% used</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
