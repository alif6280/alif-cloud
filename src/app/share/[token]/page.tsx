import { createClient } from "@/lib/supabase/server";
import { Download, Cloud, Lock, FileX } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import type { StorageFile } from "@/lib/types";

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

export default async function SharePage({ params }: { params: { token: string } }) {
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("share_links")
    .select("*, files(*)")
    .eq("token", params.token)
    .single();

  if (!link) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="glass rounded-2xl p-10 text-center border border-white/[0.06] max-w-sm w-full mx-4">
        <FileX className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h2 className="text-xl font-display font-bold text-white mb-2">Link Not Found</h2>
        <p className="text-slate-500 text-sm">This share link doesn&apos;t exist or has been deleted.</p>
      </div>
    </div>
  );

  const isExpired = link.expires_at && new Date(link.expires_at) < new Date();
  if (isExpired) return (
    <div className="min-h-screen mesh-bg flex items-center justify-center">
      <div className="glass rounded-2xl p-10 text-center border border-red-500/20 max-w-sm w-full mx-4">
        <Lock className="w-12 h-12 text-red-400/60 mx-auto mb-3" />
        <h2 className="text-xl font-display font-bold text-white mb-2">Link Expired</h2>
        <p className="text-slate-500 text-sm">This share link has expired.</p>
      </div>
    </div>
  );

  const file = link.files as StorageFile;

  // Get signed URL
  const { data: urlData } = await supabase.storage
    .from("files")
    .createSignedUrl(file.storage_path, 3600);

  // Increment use count
  await supabase.from("share_links").update({ use_count: link.use_count + 1 }).eq("id", link.id);

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center glow">
          <Cloud className="w-4 h-4 text-brand-400" />
        </div>
        <span className="font-display font-bold text-white">Alif Cloud</span>
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-8 border border-white/[0.06] max-w-sm w-full text-center animate-slide-up">
        <div className="text-6xl mb-4" style={{ filter: "drop-shadow(0 0 20px rgba(99,102,241,0.3))" }}>
          {FILE_ICONS[file.file_type]}
        </div>
        <h2 className="text-lg font-display font-bold text-white mb-1 truncate">{file.name}</h2>
        <p className="text-slate-600 text-sm mb-1">{formatBytes(file.size)}</p>
        <span className={`badge badge-${file.file_type} mb-6 inline-block`}>{file.file_type}</span>

        {link.allow_download && urlData?.signedUrl && (
          <a href={urlData.signedUrl} download={file.name}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Download className="w-4 h-4" /> Download File
          </a>
        )}

        {link.expires_at && (
          <p className="text-xs text-slate-600 mt-4 flex items-center justify-center gap-1">
            Expires {new Date(link.expires_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      <p className="text-slate-700 text-xs mt-6">Powered by Alif Cloud</p>
    </div>
  );
}
