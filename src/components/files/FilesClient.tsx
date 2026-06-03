"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload, Grid3X3, List, Search,
  Star, Trash2, Download,
  Share2, Loader2, CloudUpload, X,
  Files, HardDrive, ArrowDownToLine, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDate, getFileType, getFileColor, generateToken, STORAGE_BUCKET, MAX_FILE_SIZE } from "@/lib/utils";
import type { StorageFile, Folder as FolderType, UploadProgress } from "@/lib/types";

interface Props {
  initialFiles: StorageFile[];
  initialFolders: FolderType[];
  storageUsed?: number;
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

const TYPE_GLOW: Record<string, string> = {
  pdf:     "#ef4444",
  image:   "#22c55e",
  video:   "#a855f7",
  doc:     "#3b82f6",
  audio:   "#f59e0b",
  archive: "#f97316",
  other:   "#64748b",
};

type TabType = "all" | "image" | "doc" | "video";

export default function FilesClient({ initialFiles, initialFolders, storageUsed = 0 }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<StorageFile[]>(initialFiles);
  const [folders] = useState<FolderType[]>(initialFolders);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // ── Preview state ──────────────────────────────────────────────────────────
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Selection state ────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function showToast(msg: string, type: "success" | "error" | "info" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Storage helpers ────────────────────────────────────────────────────────
  async function incrementStorageUsed(userId: string, bytes: number) {
    const supabase = createClient();
    await supabase.rpc("increment_storage_used", { p_user_id: userId, p_bytes: bytes });
  }

  async function decrementStorageUsed(userId: string, bytes: number) {
    const supabase = createClient();
    await supabase.rpc("decrement_storage_used", { p_user_id: userId, p_bytes: bytes });
  }

  // ── Preview ────────────────────────────────────────────────────────────────
  async function openPreview(file: StorageFile) {
    setPreviewLoading(true);
    setPreviewFile(file);
    setPreviewUrl(null);
    const supabase = createClient();
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(file.storage_path, 300);
    if (data?.signedUrl) setPreviewUrl(data.signedUrl);
    setPreviewLoading(false);
  }

  function closePreview() {
    setPreviewFile(null);
    setPreviewUrl(null);
  }

  // ── Selection ──────────────────────────────────────────────────────────────
  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(f => f.id)));
    }
  }

  async function deleteSelected() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const toDelete = filtered.filter(f => selected.has(f.id));
    for (const file of toDelete) {
      await supabase.from("files").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", file.id);
      if (user) await decrementStorageUsed(user.id, file.size);
    }
    setFiles(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
    showToast(`${toDelete.length} file(s) moved to trash`);
    router.refresh();
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const file of acceptedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        showToast(`${file.name} exceeds 50MB limit`, "error");
        continue;
      }
      const id = crypto.randomUUID();
      setUploads(prev => [...prev, { file, progress: 0, status: "uploading" }]);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${id}.${ext}`;
      setUploads(prev => prev.map(u => u.file === file ? { ...u, progress: 50 } : u));
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file);
      setUploads(prev => prev.map(u => u.file === file ? { ...u, progress: 100 } : u));
      if (uploadError) {
        setUploads(prev => prev.map(u => u.file === file ? { ...u, status: "error", error: uploadError.message } : u));
        showToast(`Failed to upload ${file.name}`, "error");
        continue;
      }
      const fileType = getFileType(file.type);
      const { data: newFile, error: dbError } = await supabase.from("files").insert({
        id, user_id: user.id, name: file.name, original_name: file.name,
        storage_path: path, size: file.size, mime_type: file.type,
        file_type: fileType, is_starred: false, is_deleted: false,
        tags: [], download_count: 0,
      }).select().single();
      if (!dbError && newFile) {
        setFiles(prev => [newFile, ...prev]);
        await incrementStorageUsed(user.id, file.size);
        router.refresh();
        setUploads(prev => prev.map(u => u.file === file ? { ...u, status: "done", progress: 100 } : u));
        showToast(`${file.name} uploaded!`);
        setTimeout(() => setUploads(prev => prev.filter(u => u.file !== file)), 2000);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  // ── File actions ───────────────────────────────────────────────────────────
  async function downloadFile(file: StorageFile) {
    try {
      showToast("Preparing download...", "info");
      const url = `/api/download?path=${encodeURIComponent(file.storage_path)}&name=${encodeURIComponent(file.original_name)}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      const supabase = createClient();
      await supabase.from("files").update({ download_count: file.download_count + 1 }).eq("id", file.id);
      showToast(`Downloading ${file.name}`);
    } catch (err: any) {
      showToast(err?.message ?? "Download failed", "error");
    }
  }

  async function toggleStar(file: StorageFile) {
    const supabase = createClient();
    await supabase.from("files").update({ is_starred: !file.is_starred }).eq("id", file.id);
    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, is_starred: !f.is_starred } : f));
    showToast(file.is_starred ? "Removed from starred" : "Added to starred");
  }

  async function moveToTrash(file: StorageFile) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("files").update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq("id", file.id);
    setFiles(prev => prev.filter(f => f.id !== file.id));
    if (user) { await decrementStorageUsed(user.id, file.size); router.refresh(); }
    showToast("Moved to trash");
  }

  async function shareFile(file: StorageFile) {
    const supabase = createClient();
    const token = generateToken();
    await supabase.from("share_links").insert({
      file_id: file.id, token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      allow_download: true,
    });
    const link = `${window.location.origin}/share/${token}`;
    await navigator.clipboard.writeText(link);
    showToast("Share link copied!");
  }

  // ── Filtering ──────────────────────────────────────────────────────────────
  const tabFilteredFiles = files.filter(f => {
    if (activeTab === "all") return true;
    if (activeTab === "image") return f.file_type === "image";
    if (activeTab === "doc") return f.file_type === "doc" || f.file_type === "pdf";
    if (activeTab === "video") return f.file_type === "video";
    return true;
  });

  const filtered = tabFilteredFiles
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const allSelected = selected.size > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const totalDownloads = files.reduce((sum, f) => sum + (f.download_count || 0), 0);
  const thisWeek = files.filter(f => {
    const created = new Date(f.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return created >= weekAgo;
  }).length;

  // ── Preview renderer ───────────────────────────────────────────────────────
  function renderPreviewBody() {
    if (previewLoading) {
      return <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />;
    }
    if (!previewUrl) {
      return <p className="text-slate-500 text-sm">Failed to load preview</p>;
    }

    switch (previewFile?.file_type) {
      case "pdf":
        return (
          <object data={previewUrl} type="application/pdf" className="w-full h-full">
            <embed src={previewUrl} type="application/pdf" className="w-full h-full" />
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="text-6xl">📄</div>
              <p className="text-slate-300 font-medium">{previewFile.name}</p>
              <p className="text-slate-500 text-sm">Your browser is blocking inline PDF preview.</p>
              <div className="flex gap-3">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                  Open in new tab
                </a>
                <button onClick={() => downloadFile(previewFile)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/[0.06] text-slate-700 hover:bg-black/[0.10] transition-colors text-sm">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          </object>
        );
      case "image":
        return <img src={previewUrl} alt={previewFile?.name} className="max-w-full max-h-full object-contain" />;
      case "video":
        return <video src={previewUrl} controls className="max-w-full max-h-full" />;
      case "audio":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">🎵</div>
            <p className="text-slate-700 font-medium">{previewFile?.name}</p>
            <audio src={previewUrl} controls className="w-80" />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="text-6xl">{FILE_ICONS[previewFile?.file_type ?? "other"]}</div>
            <p className="text-slate-700 font-medium">{previewFile?.name}</p>
            <p className="text-slate-500 text-sm">Preview not available for this file type</p>
            <button onClick={() => previewFile && downloadFile(previewFile)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download to view
            </button>
          </div>
        );
    }
  }

  return (
    <div className="relative">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#0a0a0a]">My Files</h1>
          <p className="text-[#aaa] text-sm mt-0.5">{files.length} files · {formatBytes(totalSize)} used</p>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <button onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 transition-all text-sm font-medium">
              <Trash2 className="w-4 h-4" />
              Delete {selected.size} selected
            </button>
          )}
          <label className="btn-primary flex items-center gap-2 cursor-pointer text-sm py-2 px-4">
            <Upload className="w-4 h-4" />
            Upload
            <input type="file" multiple className="hidden" onChange={e => e.target.files && onDrop(Array.from(e.target.files))} />
          </label>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        {[
          { icon: Files,          value: files.length,           label: "Total Files", color: "#6366f1" },
          { icon: HardDrive,      value: formatBytes(totalSize),  label: "Used",        color: "#06b6d4" },
          { icon: ArrowDownToLine,value: totalDownloads,          label: "Downloads",   color: "#22c55e" },
          { icon: TrendingUp,     value: thisWeek,                label: "This Week",   color: "#f59e0b" },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-white py-3 px-3.5 transition-transform hover:-translate-y-0.5"
            style={{ borderRadius: "0 10px 10px 0", border: "0.5px solid rgba(0,0,0,0.07)", borderLeft: `2px solid ${color}`, boxShadow: `-3px 0 12px ${color}40, 0 4px 16px ${color}14` }}>
            <div className="text-lg font-bold text-[#0a0a0a] leading-none mb-1.5">{value}</div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color }}>
              <Icon className="w-3 h-3" />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4">
        {([
          { key: "all", label: "All" },
          { key: "image", label: "Images" },
          { key: "doc", label: "Documents" },
          { key: "video", label: "Videos" },
        ] as { key: TabType; label: string }[]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-[#0a0a0a] text-white"
                : "text-[#aaa] hover:text-[#555]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-5">
        {filtered.length > 0 && (
          <button onClick={selectAll}
            className="flex items-center gap-2 text-xs text-[#aaa] hover:text-[#555] transition-colors">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${allSelected ? "bg-[#0a0a0a] border-[#0a0a0a]" : someSelected ? "bg-[#444] border-[#444]" : "border-black/20 bg-transparent"}`}>
              {allSelected && <span className="text-white text-[10px]">✓</span>}
              {!allSelected && someSelected && <span className="text-white text-[10px]">–</span>}
            </div>
            {someSelected ? `${selected.size} selected` : "Select all"}
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] pointer-events-none z-10" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full px-3 py-2 rounded-xl bg-[#f5f5f5] border border-black/[0.08] text-[#333] placeholder-[#aaa] text-sm focus:outline-none focus:border-black/20 transition-all"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        <div className="flex rounded-lg border border-black/[0.08] overflow-hidden">
          <button onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-[#0a0a0a] text-white" : "text-[#aaa] hover:text-[#555] bg-transparent"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")}
            className={`p-2 transition-colors ${view === "list" ? "bg-[#0a0a0a] text-white" : "text-[#aaa] hover:text-[#555] bg-transparent"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Upload progress ── */}
      {uploads.length > 0 && (
        <div className="mb-4 space-y-2">
          {uploads.map((u, i) => (
            <div key={i} className="bg-[#fafafa] border border-black/[0.07] rounded-xl p-3 flex items-center gap-3">
              <div className="text-xl">{FILE_ICONS[getFileType(u.file.type)]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#333] truncate">{u.file.name}</span>
                  <span className={u.status === "error" ? "text-red-500" : "text-[#555]"}>{u.status === "error" ? "Error" : `${u.progress}%`}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${u.progress}%`, background: u.status === "error" ? "#ef4444" : undefined }} />
                </div>
              </div>
              {u.status === "uploading" && <Loader2 className="w-4 h-4 text-[#555] animate-spin" />}
              {u.status === "done" && <span className="text-green-600 text-lg">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Section title ── */}
      {filtered.length > 0 && (
        <div className="text-[11px] font-semibold text-[#aaa] uppercase tracking-widest mb-3">
          Recent Files
        </div>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
          {filtered.map(file => {
            const glowColor = TYPE_GLOW[file.file_type] ?? TYPE_GLOW.other;
            return (
            <div
              key={file.id}
              onClick={() => openPreview(file)}
              className={`group cursor-pointer relative bg-white transition-all hover:-translate-y-0.5 ${selected.has(file.id) ? "bg-[#f5f5f5]" : ""}`}
              style={{ borderRadius: 12, border: `0.5px solid rgba(0,0,0,0.07)`, borderLeft: `2px solid ${glowColor}`, boxShadow: `-3px 0 10px ${glowColor}33, 0 4px 14px ${glowColor}12`, padding: "12px" }}
            >
              <div
                onClick={e => toggleSelect(file.id, e)}
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all
                  ${selected.has(file.id)
                    ? "bg-[#0a0a0a] border-[#0a0a0a] opacity-100"
                    : "border-black/20 bg-white/80 opacity-0 group-hover:opacity-100"}`}
              >
                {selected.has(file.id) && <span className="text-white text-[10px]">✓</span>}
              </div>

              <div className="flex items-center justify-center h-14 mb-3">
                <div className="text-4xl">
                  {FILE_ICONS[file.file_type]}
                </div>
              </div>
              <p className="text-xs font-medium text-[#333] truncate mb-1" title={file.name}>{file.name}</p>
              <p className="text-[10px] text-[#aaa] font-mono">{formatBytes(file.size)}</p>
              <span className={`badge badge-${file.file_type} mt-2`}>{file.file_type}</span>

              <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={e => { e.stopPropagation(); toggleStar(file); }}
                  className={`p-1 rounded transition-colors ${file.is_starred ? "text-yellow-500" : "text-[#ccc] hover:text-yellow-500"}`}>
                  <Star className="w-3.5 h-3.5" fill={file.is_starred ? "currentColor" : "none"} />
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={e => { e.stopPropagation(); downloadFile(file); }}
                    className="p-1 rounded text-[#ccc] hover:text-[#0a0a0a] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); shareFile(file); }}
                    className="p-1 rounded text-[#ccc] hover:text-green-600 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); moveToTrash(file); }}
                    className="p-1 rounded text-[#ccc] hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && filtered.length > 0 && (
        <div className="rounded-xl border border-black/[0.07] pb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.07] bg-[#fafafa]">
                <th className="px-4 py-3 w-8">
                  <div onClick={selectAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${allSelected ? "bg-[#0a0a0a] border-[#0a0a0a]" : "border-black/20"}`}>
                    {allSelected && <span className="text-white text-[10px]">✓</span>}
                    {!allSelected && someSelected && <span className="text-white text-[10px]">–</span>}
                  </div>
                </th>
                {["Name", "Size", "Type", "Date", ""].map(h => (
                  <th key={h} className="text-left text-xs text-[#aaa] font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => (
                <tr key={file.id}
                  onClick={() => openPreview(file)}
                  className={`border-b border-black/[0.04] hover:bg-[#fafafa] transition-colors group cursor-pointer ${selected.has(file.id) ? "bg-[#f5f5f5]" : ""}`}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div onClick={e => toggleSelect(file.id, e)}
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${selected.has(file.id) ? "bg-[#0a0a0a] border-[#0a0a0a]" : "border-black/20"}`}>
                      {selected.has(file.id) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{FILE_ICONS[file.file_type]}</span>
                      <span className="text-sm text-[#333] font-medium truncate max-w-[200px]">{file.name}</span>
                      {file.is_starred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#aaa] font-mono">{formatBytes(file.size)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${file.file_type}`}>{file.file_type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#aaa]">{formatDate(file.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button type="button" onClick={e => { e.stopPropagation(); downloadFile(file); }} className="p-1.5 rounded-lg hover:bg-black/[0.06] text-[#aaa] hover:text-[#0a0a0a] transition-colors"><Download className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); shareFile(file); }} className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#aaa] hover:text-green-600 transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); toggleStar(file); }} className={`p-1.5 rounded-lg transition-colors ${file.is_starred ? "text-yellow-500" : "text-[#aaa] hover:text-yellow-500 hover:bg-yellow-500/10"}`}><Star className="w-3.5 h-3.5" fill={file.is_starred ? "currentColor" : "none"} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); moveToTrash(file); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#aaa] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && uploads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CloudUpload className="w-14 h-14 text-[#ccc] mb-4" />
          <p className="text-lg font-display font-semibold text-[#aaa] mb-1">
            {search ? "No files found" : "No files yet"}
          </p>
          <p className="text-[#bbb] text-sm max-w-xs">
            {search ? "Try a different search term" : "Upload files to get started"}
          </p>
        </div>
      )}

      {/* ── Drop zone (always at bottom) ── */}
      <div {...getRootProps()} className="mt-4">
        <input {...getInputProps()} />
        <div className={`upload-zone p-6 flex flex-col items-center gap-2 cursor-pointer ${isDragActive ? "border-[#0a0a0a]/40 bg-[#f0f0f0]" : ""}`}>
          <CloudUpload className="w-7 h-7 text-[#ccc]" />
          <p className="text-sm font-semibold text-[#aaa]">Drop files here or click to browse</p>
          <label className="mt-2 px-5 py-2 rounded-xl bg-[#0a0a0a] text-white text-sm font-semibold cursor-pointer hover:bg-[#222] transition-colors">
            Upload Files
            <input type="file" multiple className="hidden" onChange={e => e.target.files && onDrop(Array.from(e.target.files))} />
          </label>
        </div>
      </div>

      {/* ── Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={closePreview}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative z-10 flex flex-col w-[90vw] h-[90vh] max-w-5xl bg-white rounded-2xl border border-black/[0.08] overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.07]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{FILE_ICONS[previewFile.file_type]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#333] truncate">{previewFile.name}</p>
                  <p className="text-xs text-[#aaa]">{formatBytes(previewFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => downloadFile(previewFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f5f5] text-[#333] hover:bg-[#eee] transition-colors text-xs font-medium border border-black/[0.07]">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={closePreview}
                  className="p-1.5 rounded-lg text-[#aaa] hover:text-[#333] hover:bg-[#f5f5f5] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#fafafa]">
              {renderPreviewBody()}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
