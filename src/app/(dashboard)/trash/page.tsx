"use client";
import { useState, useEffect } from "react";
import { Trash2, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDate } from "@/lib/utils";
import type { StorageFile } from "@/lib/types";
import { useRouter } from "next/navigation";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

export default function TrashPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_deleted", true)
        .order("deleted_at", { ascending: false });
      setFiles((data ?? []) as StorageFile[]);
      setLoading(false);
    }
    load();
  }, []);

  async function restore(file: StorageFile) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase
      .from("files")
      .update({ is_deleted: false, deleted_at: null })
      .eq("id", file.id);

    // ✅ restore হলে storage_used বাড়ানো
    if (user) {
      await supabase.rpc("increment_storage_used", {
        p_user_id: user.id,
        p_bytes: file.size,
      });
    }

    setFiles(prev => prev.filter(f => f.id !== file.id));
    showToast("File restored!");
    router.refresh();
  }

  async function deletePermanently(file: StorageFile) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.storage.from("files").remove([file.storage_path]);
    await supabase.from("files").delete().eq("id", file.id);

    // ✅ permanent delete হলে storage_used কমানো
    if (user) {
      await supabase.rpc("decrement_storage_used", {
        p_user_id: user.id,
        p_bytes: file.size,
      });
    }

    setFiles(prev => prev.filter(f => f.id !== file.id));
    showToast("Permanently deleted");
    router.refresh();
  }

  async function emptyTrash() {
    for (const f of files) await deletePermanently(f);
    showToast("Trash emptied!");
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <Trash2 className="w-6 h-6 text-red-400" /> Trash
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">Files are auto-deleted after 30 days</p>
        </div>
        {files.length > 0 && (
          <button onClick={emptyTrash}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium">
            <AlertTriangle className="w-4 h-4" /> Empty Trash
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 upload-zone">
          <Trash2 className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-slate-400 font-display font-semibold">Trash is empty</p>
          <p className="text-slate-600 text-sm mt-1">Deleted files will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id} className="flex items-center gap-4 p-4 glass rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-all group">
              <span className="text-2xl">{FILE_ICONS[file.file_type]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 font-medium truncate">{file.name}</p>
                <p className="text-xs text-slate-600 mt-0.5">{formatBytes(file.size)} · Deleted {file.deleted_at ? formatDate(file.deleted_at) : "recently"}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => restore(file)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors text-xs font-medium">
                  <RotateCcw className="w-3.5 h-3.5" /> Restore
                </button>
                <button onClick={() => deletePermanently(file)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="toast toast-success">{toast}</div>
      )}
    </div>
  );
}