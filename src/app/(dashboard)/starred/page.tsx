import { createClient } from "@/lib/supabase/server";
import { Star } from "lucide-react";
import { formatBytes, formatDate, getFileColor } from "@/lib/utils";
import type { StorageFile } from "@/lib/types";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

export default async function StarredPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_starred", true)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const starred = (files ?? []) as StorageFile[];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400 fill-current" /> Starred
        </h1>
        <p className="text-slate-600 text-sm mt-0.5">{starred.length} starred files</p>
      </div>

      {starred.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 upload-zone">
          <Star className="w-12 h-12 text-yellow-400/30 mb-3" />
          <p className="text-slate-400 font-display font-semibold">No starred files</p>
          <p className="text-slate-600 text-sm mt-1">Star important files for quick access</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {starred.map(file => (
            <div key={file.id} className="file-card group">
              <div className="flex items-center justify-center h-14 mb-3">
                <div className="text-4xl" style={{ filter: `drop-shadow(0 0 8px ${getFileColor(file.file_type)}50)` }}>
                  {FILE_ICONS[file.file_type]}
                </div>
              </div>
              <p className="text-xs font-medium text-slate-300 truncate mb-1">{file.name}</p>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-slate-600">{formatBytes(file.size)}</p>
                <p className="text-[10px] text-slate-600">{formatDate(file.created_at)}</p>
              </div>
              <Star className="absolute top-3 right-3 w-3.5 h-3.5 text-yellow-400 fill-current" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
