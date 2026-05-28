import { createClient } from "@/lib/supabase/server";
import FilesClient from "@/components/files/FilesClient";

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const { data: folders } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user!.id)
    .is("parent_id", null)
    .order("created_at", { ascending: false });

  return <FilesClient initialFiles={files ?? []} initialFolders={folders ?? []} />;
}
