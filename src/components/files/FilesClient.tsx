"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Upload, Grid3X3, List, Search,
  Star, Trash2, Download,
  Share2, Loader2, CloudUpload, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDate, getFileType, getFileColor, generateToken, STORAGE_BUCKET, MAX_FILE_SIZE } from "@/lib/utils";
import type { StorageFile, Folder as FolderType, UploadProgress } from "@/lib/types";

interface Props {
  initialFiles: StorageFile[];
  initialFolders: FolderType[];
}

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", image: "🖼️", video: "🎬", doc: "📝",
  audio: "🎵", archive: "📦", other: "📎",
};

export default function FilesClient({ initialFiles, initialFolders }: Props) {
  const router = useRouter();
  const [files, setFiles] = useState<StorageFile[]>(initialFiles);
  const [folders] = useState<FolderType[]>(initialFolders);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

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
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        onUploadProgress: ({ loaded, total }) => {
          const pct = Math.round((loaded / (total ?? 1)) * 100);
          setUploads(prev => prev.map(u => u.file === file ? { ...u, progress: pct } : u));
        },
      });
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
  // FIX: Use download: filename param to force Content-Disposition: attachment
  // and window.open() instead of anchor click for reliability
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

  const filtered = files
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const allSelected = selected.size > 0 && selected.size === filtered.length;
  const someSelected = selected.size > 0;

  // ── PDF Preview renderer ───────────────────────────────────────────────────
  function renderPreviewBody() {
    if (previewLoading) {
      return <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />;
    }
    if (!previewUrl) {
      return <p className="text-slate-500 text-sm">Failed to load preview</p>;
    }

    switch (previewFile?.file_type) {
      case "pdf":
        // FIX: Use <object> + <embed> instead of <iframe> to avoid browser CSP blocking
        return (
          <object
            data={previewUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <embed
              src={previewUrl}
              type="application/pdf"
              className="w-full h-full"
            />
            {/* Fallback when both object and embed are blocked */}
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="text-6xl">📄</div>
              <p className="text-slate-300 font-medium">{previewFile.name}</p>
              <p className="text-slate-500 text-sm">
                Your browser is blocking inline PDF preview.
              </p>
              <div className="flex gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                >
                  Open in new tab
                </a>
                <button
                  onClick={() => downloadFile(previewFile)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] text-slate-300 hover:bg-white/[0.10] transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          </object>
        );

      case "image":
        return (
          <img
            src={previewUrl}
            alt={previewFile?.name}
            className="max-w-full max-h-full object-contain"
          />
        );

      case "video":
        return (
          <video
            src={previewUrl}
            controls
            className="max-w-full max-h-full"
          />
        );

      case "audio":
        return (
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">🎵</div>
            <p className="text-slate-300 font-medium">{previewFile?.name}</p>
            <audio src={previewUrl} controls className="w-80" />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="text-6xl">{FILE_ICONS[previewFile?.file_type ?? "other"]}</div>
            <p className="text-slate-300 font-medium">{previewFile?.name}</p>
            <p className="text-slate-500 text-sm">Preview not available for this file type</p>
            <button
              onClick={() => previewFile && downloadFile(previewFile)}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download to view
            </button>
          </div>
        );
    }
  }

  return (
    <div className="h-full flex flex-col relative">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">My Files</h1>
          <p className="text-slate-600 text-sm mt-0.5">{files.length} files</p>
        </div>
        <div className="flex items-center gap-2">
          {someSelected && (
            <button onClick={deleteSelected}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium">
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

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        {filtered.length > 0 && (
          <button onClick={selectAll}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${allSelected ? "bg-brand-600 border-brand-500" : someSelected ? "bg-brand-600/50 border-brand-500/50" : "border-white/20 bg-transparent"}`}>
              {allSelected && <span className="text-white text-[10px]">✓</span>}
              {!allSelected && someSelected && <span className="text-white text-[10px]">–</span>}
            </div>
            {someSelected ? `${selected.size} selected` : "Select all"}
          </button>
        )}

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="input-field py-2 text-sm w-full"
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
        <div className="flex rounded-lg border border-white/[0.06] overflow-hidden flex-shrink-0">
          <button onClick={() => setView("grid")}
            className={`p-2 transition-colors ${view === "grid" ? "bg-brand-600/20 text-brand-400" : "text-slate-600 hover:text-slate-400 bg-transparent"}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")}
            className={`p-2 transition-colors ${view === "list" ? "bg-brand-600/20 text-brand-400" : "text-slate-600 hover:text-slate-400 bg-transparent"}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Upload progress ── */}
      {uploads.length > 0 && (
        <div className="mb-4 space-y-2 flex-shrink-0">
          {uploads.map((u, i) => (
            <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="text-xl">{FILE_ICONS[getFileType(u.file.type)]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 truncate">{u.file.name}</span>
                  <span className={u.status === "error" ? "text-red-400" : "text-brand-400"}>{u.status === "error" ? "Error" : `${u.progress}%`}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${u.progress}%`, background: u.status === "error" ? "#ef4444" : undefined }} />
                </div>
              </div>
              {u.status === "uploading" && <Loader2 className="w-4 h-4 text-brand-400 animate-spin flex-shrink-0" />}
              {u.status === "done" && <span className="text-green-400 text-lg">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && uploads.length === 0 && (
        <div {...getRootProps()} className="flex-1 flex flex-col items-center justify-center upload-zone mx-0 cursor-pointer">
          <input {...getInputProps()} />
          <CloudUpload className="w-14 h-14 text-brand-500/40 mb-4" />
          <p className="text-lg font-display font-semibold text-slate-400 mb-1">
            {search ? "No files found" : "No files yet"}
          </p>
          <p className="text-slate-600 text-sm text-center max-w-xs">
            {search ? "Try a different search term" : "Drag & drop files here or click Upload to get started"}
          </p>
          {isDragActive && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl border-2 border-brand-500/60 bg-brand-950/80 backdrop-blur-sm">
              <CloudUpload className="w-16 h-16 text-brand-400 animate-bounce mb-3" />
              <p className="text-xl font-display font-bold text-brand-300">Drop files here</p>
            </div>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 overflow-y-auto pb-4">
          {filtered.map(file => (
            <div
              key={file.id}
              onClick={() => openPreview(file)}
              className={`file-card group cursor-pointer relative ${selected.has(file.id) ? "border-brand-500/50 bg-brand-600/10" : ""}`}
            >
              <div
                onClick={e => toggleSelect(file.id, e)}
                className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all
                  ${selected.has(file.id)
                    ? "bg-brand-600 border-brand-500 opacity-100"
                    : "border-white/20 bg-black/40 opacity-0 group-hover:opacity-100"}`}
              >
                {selected.has(file.id) && <span className="text-white text-[10px]">✓</span>}
              </div>

              <div className="flex items-center justify-center h-14 mb-3">
                <div className="text-4xl" style={{ filter: `drop-shadow(0 0 8px ${getFileColor(file.file_type)}50)` }}>
                  {FILE_ICONS[file.file_type]}
                </div>
              </div>
              <p className="text-xs font-medium text-slate-300 truncate mb-1" title={file.name}>{file.name}</p>
              <p className="text-[10px] text-slate-600">{formatBytes(file.size)}</p>

              <div className="flex items-center justify-between mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" onClick={e => { e.stopPropagation(); toggleStar(file); }}
                  className={`p-1 rounded transition-colors ${file.is_starred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400"}`}>
                  <Star className="w-3.5 h-3.5" fill={file.is_starred ? "currentColor" : "none"} />
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={e => { e.stopPropagation(); downloadFile(file); }}
                    className="p-1 rounded text-slate-600 hover:text-brand-400 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); shareFile(file); }}
                    className="p-1 rounded text-slate-600 hover:text-green-400 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={e => { e.stopPropagation(); moveToTrash(file); }}
                    className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && filtered.length > 0 && (
        <div className="overflow-y-auto rounded-xl border border-white/[0.05] pb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-4 py-3 w-8">
                  <div onClick={selectAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${allSelected ? "bg-brand-600 border-brand-500" : "border-white/20"}`}>
                    {allSelected && <span className="text-white text-[10px]">✓</span>}
                    {!allSelected && someSelected && <span className="text-white text-[10px]">–</span>}
                  </div>
                </th>
                {["Name", "Size", "Type", "Date", ""].map(h => (
                  <th key={h} className="text-left text-xs text-slate-600 font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => (
                <tr key={file.id}
                  onClick={() => openPreview(file)}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group cursor-pointer ${selected.has(file.id) ? "bg-brand-600/10" : ""}`}>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div onClick={e => toggleSelect(file.id, e)}
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${selected.has(file.id) ? "bg-brand-600 border-brand-500" : "border-white/20"}`}>
                      {selected.has(file.id) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{FILE_ICONS[file.file_type]}</span>
                      <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">{file.name}</span>
                      {file.is_starred && <Star className="w-3 h-3 text-yellow-400 fill-current flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatBytes(file.size)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${file.file_type}`}>{file.file_type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{formatDate(file.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <button type="button" onClick={e => { e.stopPropagation(); downloadFile(file); }} className="p-1.5 rounded-lg hover:bg-brand-500/10 text-slate-600 hover:text-brand-400 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); shareFile(file); }} className="p-1.5 rounded-lg hover:bg-green-500/10 text-slate-600 hover:text-green-400 transition-colors"><Share2 className="w-3.5 h-3.5" /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); toggleStar(file); }} className={`p-1.5 rounded-lg transition-colors ${file.is_starred ? "text-yellow-400" : "text-slate-600 hover:text-yellow-400 hover:bg-yellow-500/10"}`}><Star className="w-3.5 h-3.5" fill={file.is_starred ? "currentColor" : "none"} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); moveToTrash(file); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PDF / File Preview Modal ── */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={closePreview}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative z-10 flex flex-col w-[90vw] h-[90vh] max-w-5xl glass rounded-2xl border border-white/[0.08] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl">{FILE_ICONS[previewFile.file_type]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{previewFile.name}</p>
                  <p className="text-xs text-slate-600">{formatBytes(previewFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => downloadFile(previewFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 transition-colors text-xs font-medium">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={closePreview}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal body — uses renderPreviewBody() for clean separation */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/20">
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