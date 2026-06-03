"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cloud, Files, Star, Trash2, Share2, BarChart2,
  Settings, LogOut, HardDrive, Menu, X, Shield
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatBytes } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { useState } from "react";

const navItems = [
  { href: "/files",     icon: Files,     label: "My Files"   },
  { href: "/starred",   icon: Star,      label: "Starred"    },
  { href: "/shared",    icon: Share2,    label: "Shared"     },
  { href: "/trash",     icon: Trash2,    label: "Trash"      },
  { href: "/analytics", icon: BarChart2, label: "Analytics"  },
  { href: "/settings",  icon: Settings,  label: "Settings"   },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const used = profile?.storage_used ?? 0;
  const quota = profile?.storage_quota ?? 1073741824;
  const pct = Math.min((used / quota) * 100, 100);

  const expanded = hovered;

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const SidebarContent = ({ forceExpand = false }: { forceExpand?: boolean }) => {
    const show = forceExpand || expanded;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="px-3 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Cloud className="w-5 h-5 text-[#0a0a0a]" />
            </div>
            <div className={`overflow-hidden transition-all duration-200 ${show ? "w-32 opacity-100" : "w-0 opacity-0"}`}>
              <div className="font-display font-bold text-white text-base leading-none tracking-tight whitespace-nowrap">Alif Cloud</div>
              <div className="text-[11px] text-white/50 mt-0.5 font-mono font-bold whitespace-nowrap">Personal Storage</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-sm
                ${pathname.startsWith(href)
                  ? "bg-white text-[#0a0a0a]"
                  : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${show ? "w-28 opacity-100" : "w-0 opacity-0"}`}>
                {label}
              </span>
            </Link>
          ))}

          {profile?.role === "admin" && (
            <div className="pt-3 mt-2 border-t border-white/[0.06]">
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-sm
                  ${pathname.startsWith("/admin")
                    ? "bg-white text-[#0a0a0a]"
                    : "text-red-400/80 hover:text-red-300 hover:bg-red-500/10"
                  }`}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${show ? "w-28 opacity-100" : "w-0 opacity-0"}`}>
                  Admin Panel
                </span>
              </Link>
            </div>
          )}
        </nav>

        {/* Storage + Sign out */}
        <div className="px-2 py-4 border-t border-white/[0.06]">
          <div className={`overflow-hidden transition-all duration-200 ${show ? "max-h-24 opacity-100 mb-2" : "max-h-0 opacity-0 mb-0"}`}>
            <div className="bg-[#141414] rounded-xl p-3 border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                <span className="text-xs text-white font-bold whitespace-nowrap">Storage</span>
              </div>
              <div className="progress-bar mb-1.5">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-white/40 font-mono font-bold">
                <span>{formatBytes(used)} used</span>
                <span>{formatBytes(quota)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full font-bold text-sm text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${show ? "w-28 opacity-100" : "w-0 opacity-0"}`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-[#0a0a0a] border border-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer — always expanded */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-60 z-50 bg-[#0a0a0a] border-r border-white/[0.06] transform transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent forceExpand />
      </aside>

      {/* Desktop hover sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`hidden lg:flex flex-col flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] overflow-hidden transition-all duration-200 ease-in-out ${hovered ? "w-56" : "w-[60px]"}`}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
