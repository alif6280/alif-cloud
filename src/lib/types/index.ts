export type FileType = "pdf" | "image" | "video" | "doc" | "audio" | "archive" | "other";

export interface StorageFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  storage_path: string;
  size: number;
  mime_type: string;
  file_type: FileType;
  is_starred: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  tags: string[];
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

export interface ShareLink {
  id: string;
  file_id: string;
  token: string;
  password: string | null;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  allow_download: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  storage_used: number;
  storage_quota: number;
  created_at: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}
