"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield, Users, Mail, BarChart2, LogOut, Cloud, Menu, X, Home
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { Profile } from "@/lib/types";

const navItems = [
  { href: "/admin",          icon: BarChart2, label: "Overview",       exact: true },
  { href: "/admin/users",    icon: Users,     label: "Users"           },
  { href: "/admin/emails",   icon: Mail,      label: "Allowed Emails"  },
];

export default function AdminSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-base leading-none">Admin Panel</div>
            <div className="text-[10px] text-red-400/60 mt-0.5 font-mono">ALIF.CLOUD</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`sidebar-item ${isActive({ href, exact }) ? "active" : ""}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 mt-3 border-t border-white/[0.04]">
          <Link
            href="/files"
            onClick={() => setMobileOpen(false)}
            className="sidebar-item text-slate-500 hover:text-slate-300"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            Back to App
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 text-xs font-bold flex-shrink-0">
            {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white font-medium truncate">{profile?.full_name ?? "Admin"}</p>
            <p className="text-[10px] text-slate-600 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="sidebar-item w-full text-red-500/70 hover:text-red-400 hover:bg-red-500/5"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-[#08080f] border border-white/[0.08] flex items-center justify-center text-slate-400"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-50 bg-[#08080f] border-r border-white/[0.04] transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col border-r border-white/[0.04] bg-[#08080f] overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
}
