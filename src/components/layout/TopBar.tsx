"use client";
import { useState } from "react";
import { Search, Bell, User } from "lucide-react";
import type { Profile } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface TopBarProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export default function TopBar({ user, profile }: TopBarProps) {
  const [search, setSearch] = useState("");
  const name = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/[0.04] bg-[#08080f]/80 backdrop-blur-xl flex-shrink-0">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search files..."
          className="input-field py-2 text-sm"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-brand-300 text-xs font-bold font-display">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white leading-none">{name}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{profile?.role === "admin" ? "Admin" : "Personal"}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
