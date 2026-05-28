-- =============================================
-- ALIF CLOUD — SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  role            TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  storage_used    BIGINT DEFAULT 0,
  storage_quota   BIGINT DEFAULT 1073741824,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FOLDERS
CREATE TABLE IF NOT EXISTS folders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES folders(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- FILES
CREATE TABLE IF NOT EXISTS files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id       UUID REFERENCES folders(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  original_name   TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  size            BIGINT NOT NULL,
  mime_type       TEXT,
  file_type       TEXT DEFAULT 'other',
  is_starred      BOOLEAN DEFAULT FALSE,
  is_deleted      BOOLEAN DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  tags            TEXT[] DEFAULT '{}',
  download_count  INT DEFAULT 0,
  checksum        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SHARE LINKS
CREATE TABLE IF NOT EXISTS share_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         UUID REFERENCES files(id) ON DELETE CASCADE,
  token           TEXT UNIQUE NOT NULL,
  password        TEXT,
  expires_at      TIMESTAMPTZ,
  max_uses        INT,
  use_count       INT DEFAULT 0,
  allow_download  BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_id     UUID REFERENCES files(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Folders
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own folders" ON folders FOR ALL USING (auth.uid() = user_id);

-- Files
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own files" ON files FOR ALL USING (auth.uid() = user_id);

-- Share links (public read by token, owner full access)
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read share links" ON share_links FOR SELECT USING (true);
CREATE POLICY "Owner manages share links"   ON share_links FOR ALL
  USING (file_id IN (SELECT id FROM files WHERE user_id = auth.uid()));

-- Activity log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own activity" ON activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Run in Supabase Dashboard → Storage → New Bucket:
-- Name: files
-- Public: FALSE
-- File size limit: 52428800 (50MB)

-- Storage policies (run in SQL editor):
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('files', 'files', false, 52428800)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users view own files" ON storage.objects FOR SELECT
  USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own files" ON storage.objects FOR DELETE
  USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);
