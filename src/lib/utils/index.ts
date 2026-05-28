import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FileType } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document") || mimeType.includes("text")) return "doc";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return "archive";
  return "other";
}

export function getFileIcon(fileType: FileType): string {
  const icons: Record<FileType, string> = {
    pdf: "📄", image: "🖼️", video: "🎬",
    doc: "📝", audio: "🎵", archive: "📦", other: "📎",
  };
  return icons[fileType];
}

export function getFileColor(fileType: FileType): string {
  const colors: Record<FileType, string> = {
    pdf: "#ef4444", image: "#22c55e", video: "#a855f7",
    doc: "#3b82f6", audio: "#f59e0b", archive: "#f97316", other: "#64748b",
  };
  return colors[fileType];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const STORAGE_BUCKET = "files";
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_TYPES = [
  "image/*", "video/*", "audio/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip", "application/x-rar-compressed",
  "text/plain", "text/csv",
];
