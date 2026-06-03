import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: files }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("files").select("size").eq("user_id", user.id).eq("is_deleted", false),
  ]);

  const realStorageUsed = (files ?? []).reduce((sum: number, f: any) => sum + (f.size ?? 0), 0);
  const profileWithRealStorage = profile ? { ...profile, storage_used: realStorageUsed } : profile;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar profile={profileWithRealStorage} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
        <TopBar user={user} profile={profileWithRealStorage} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
