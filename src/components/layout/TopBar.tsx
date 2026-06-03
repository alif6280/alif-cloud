"use client";
import { Bell } from "lucide-react";
import type { Profile } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface TopBarProps {
  user: SupabaseUser;
  profile: Profile | null;
}

export default function TopBar({ user, profile }: TopBarProps) {
  const name = profile?.full_name || user.email?.split("@")[0] || "User";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="flex items-center justify-end px-4 sm:px-6 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a] flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-9 h-9 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-center text-white/50 hover:text-white hover:bg-[#222] transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white" />
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#2a2a2a]">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[#0a0a0a] text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold text-white leading-none truncate max-w-[100px]">{name}</div>
            <div className="text-[10px] text-white/40 mt-0.5 font-bold">
              {profile?.role === "admin" ? "Admin" : "Personal"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
