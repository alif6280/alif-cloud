# ☁️ Alif Cloud — Personal Cloud Storage

A beautiful, professional personal cloud storage system built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

---

## ✨ Features

- 📁 Upload, download, rename, delete files
- 🖼️ PDF, images, videos, documents support
- ⭐ Star important files
- 🗑️ Trash with 30-day auto-delete
- 🔗 Shareable links with expiry
- 📊 Analytics dashboard with charts
- 🔒 Secure auth (email + Google OAuth)
- 🌙 Dark mode design
- 📱 Responsive layout

---

## 🚀 Setup Guide

### Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → Run
3. Go to **Authentication → Providers** → Enable Google (optional)
4. Go to **Project Settings → API** → Copy:
   - `Project URL`
   - `anon public key`

### Step 2 — Environment Variables

Edit `.env.local` and replace:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3 — Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 4 — Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add environment variables
4. Deploy!

---

## 🛡️ Disable Signup (Personal Use)

After creating your account:

1. Supabase Dashboard → **Authentication → Settings**
2. Turn off **"Enable Sign Ups"**
3. Only you can log in now!

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (auth)/login        ← Login page
│   ├── (auth)/signup       ← Signup page
│   ├── (dashboard)/files   ← Main file manager
│   ├── (dashboard)/starred ← Starred files
│   ├── (dashboard)/trash   ← Recycle bin
│   ├── (dashboard)/shared  ← Share links
│   ├── (dashboard)/analytics ← Charts
│   ├── (dashboard)/settings  ← User settings
│   └── share/[token]       ← Public share page
├── components/
│   ├── layout/Sidebar.tsx
│   ├── layout/TopBar.tsx
│   └── files/FilesClient.tsx
└── lib/
    ├── supabase/
    ├── utils/
    └── types/
```

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL (Supabase) |
| Storage | Supabase Storage |
| Auth | Supabase Auth |
| Charts | Recharts |
| Deploy | Vercel |

---

Made with ❤️ — Alif Cloud
