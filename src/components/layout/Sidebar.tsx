"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, Files, Star, Trash2, Share2, BarChart2, Settings, LogOut, HardDrive } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const navItems = [
  { href: "/files",     icon: Files,    label: "My Files" },
  { href: "/starred",   icon: Star,     label: "Starred" },
  { href: "/shared",    icon: Share2,   label: "Shared" },
  { href: "/trash",     icon: Trash2,   label: "Trash" },
  { href: "/analytics", icon: BarChart2,label: "Analytics" },
  { href: "/settings",  icon: Settings, label: "Settings" },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const used = profile?.storage_used ?? 0;
  const quota = profile?.storage_quota ?? 1073741824;
  const pct = Math.min((used / quota) * 100, 100);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r border-white/[0.04] bg-[#08080f] overflow-y-auto">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center glow flex-shrink-0">
            <Cloud className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base leading-none">Alif Cloud</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Personal Storage</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}
            className={`sidebar-item ${pathname.startsWith(href) ? "active" : ""}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Storage */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs text-slate-400 font-medium">Storage</span>
          </div>
          <div className="progress-bar mb-1.5">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-600">
            <span>{formatBytes(used)} used</span>
            <span>{formatBytes(quota)}</span>
          </div>
        </div>

        <button onClick={signOut}
          className="sidebar-item w-full mt-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/5">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
