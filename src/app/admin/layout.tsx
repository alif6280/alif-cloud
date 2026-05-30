import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/files");

  return (
    <div className="flex h-screen overflow-hidden bg-[#070710]">
      <AdminSidebar profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.04] bg-[#08080f]/80 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
              ADMIN
            </span>
            <span className="text-slate-500 text-sm hidden sm:block">Control Panel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 text-xs font-bold">
              {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className="text-xs text-slate-400 hidden sm:block">{profile?.email}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
