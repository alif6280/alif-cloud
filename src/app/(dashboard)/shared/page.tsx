"use client";
import { useEffect, useState } from "react";
import { Share2, Copy, Trash2, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface ShareLinkWithFile {
  id: string;
  token: string;
  expires_at: string | null;
  use_count: number;
  allow_download: boolean;
  created_at: string;
  files: { name: string; file_type: string } | null;
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

export default function SharedPage() {
  const [links, setLinks] = useState<ShareLinkWithFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("share_links")
        .select("*, files(name, file_type)")
        .eq("files.user_id", user!.id)
        .order("created_at", { ascending: false });
      setLinks((data ?? []) as ShareLinkWithFile[]);
      setLoading(false);
    }
    load();
  }, []);

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    showToast("Link copied!");
  }

  async function deleteLink(id: string) {
    const supabase = createClient();
    await supabase.from("share_links").delete().eq("id", id);
    setLinks(prev => prev.filter(l => l.id !== id));
    showToast("Link deleted");
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-[#0a0a0a] flex items-center gap-2">
          <Share2 className="w-6 h-6 text-green-400" /> Shared Links
        </h1>
        <p className="text-[#aaa] text-sm mt-0.5">{links.length} active share links</p>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 upload-zone">
          <Share2 className="w-12 h-12 text-[#aaa] mb-3" />
          <p className="text-[#888] font-display font-semibold">No shared links</p>
          <p className="text-[#aaa] text-sm mt-1">Share files from My Files to see links here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map(link => (
            <div key={link.id} className={`flex items-center gap-4 p-4 glass rounded-xl border transition-all group ${isExpired(link.expires_at) ? "border-red-500/20 opacity-60" : "border-white/[0.04] hover:border-black/[0.08]"}`}>
              <span className="text-2xl">{FILE_ICONS[link.files?.file_type ?? "other"]}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#333] font-medium truncate">{link.files?.name ?? "Unknown file"}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-[#aaa]">Created {formatDate(link.created_at)}</span>
                  {link.expires_at && (
                    <span className={`flex items-center gap-1 text-xs ${isExpired(link.expires_at) ? "text-red-400" : "text-[#aaa]"}`}>
                      <Clock className="w-3 h-3" />
                      {isExpired(link.expires_at) ? "Expired" : `Expires ${formatDate(link.expires_at)}`}
                    </span>
                  )}
                  <span className="text-xs text-[#aaa]">{link.use_count} uses</span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!isExpired(link.expires_at) && (
                  <button onClick={() => copyLink(link.token)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors text-xs font-medium">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                )}
                <button onClick={() => deleteLink(link.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
}
