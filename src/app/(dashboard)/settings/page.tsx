"use client";
import { useEffect, useState } from "react";
import { Settings, User, Lock, Shield, Bell, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      setProfile(data as Profile);
      setFullName(data?.full_name ?? "");
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user!.id);
    setSaving(false);
    if (error) showToast("Failed to save", "error");
    else showToast("Profile updated!");
  }

  async function changePassword() {
    if (newPassword.length < 8) return showToast("Min 8 characters", "error");
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) showToast("Failed to update password", "error");
    else { showToast("Password updated!"); setNewPassword(""); }
  }

  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[#0a0a0a] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#0a0a0a]" /> Settings
        </h1>
        <p className="text-[#aaa] text-sm mt-0.5">Manage your account</p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <div className="rounded-2xl p-6 border border-black/[0.08] bg-[#fafafa]">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-display font-semibold text-[#0a0a0a]">Profile</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0a] flex items-center justify-center text-white text-lg font-bold font-display">
              {initials}
            </div>
            <div>
              <p className="text-[#0a0a0a] font-semibold">{fullName || "Your Name"}</p>
              <p className="text-[#aaa] text-xs mt-0.5">{profile?.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-black/[0.06] text-[#555] mt-1 uppercase tracking-wide">
                {profile?.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#888] mb-1.5 font-semibold uppercase tracking-wide">Full Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/[0.1] text-[#0a0a0a] placeholder-[#bbb] text-sm focus:outline-none focus:border-black/25 transition-all mb-4"
            />
            <button onClick={saveProfile} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0a] text-white text-sm font-semibold hover:bg-[#222] transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl p-6 border border-black/[0.08] bg-[#fafafa]">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-display font-semibold text-[#0a0a0a]">Change Password</h2>
          </div>
          <div className="relative mb-4">
            <input
              type={showPass ? "text" : "password"}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password (min 8 chars)"
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-black/[0.1] text-[#0a0a0a] placeholder-[#bbb] text-sm focus:outline-none focus:border-black/25 transition-all pr-10"
            />
            <button onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bbb] hover:text-[#888] transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button onClick={changePassword} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0a] text-white text-sm font-semibold hover:bg-[#222] transition-all disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
            Update Password
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl p-6 border border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-display font-semibold text-red-600">Danger Zone</h2>
          </div>
          <p className="text-[#888] text-xs mb-4">Deleting your account is permanent and cannot be undone. All files will be lost.</p>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-200 text-red-600 hover:bg-red-500/20 transition-all text-sm font-semibold">
            Delete Account
          </button>
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span> {toast.msg}
        </div>
      )}
    </div>
  );
}
