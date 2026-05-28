<div align="center">

<br/>

<h1>☁️ ALIF CLOUD</h1>

<h3>Your Personal Cloud Storage — Beautiful, Fast & Secure</h3>

<br/>

<img src="https://img.shields.io/badge/Next.js-14-FF6B6B?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.0-4ECDC4?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Supabase-Backend-45B7D1?style=for-the-badge&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-96CEB4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Framer_Motion-11-FFEAA7?style=for-the-badge&logo=framer&logoColor=black"/>
<img src="https://img.shields.io/badge/Vercel-Live-DDA0DD?style=for-the-badge&logo=vercel&logoColor=white"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-F0A500?style=for-the-badge&logo=postgresql&logoColor=white"/>

<br/><br/>

> **Your own private Google Drive — but you own everything, forever.**

<br/>

</div>

---

## 🌐 Live Demo

> 🚀 **The app is live and running!**

**[👉 Visit Alif Cloud — Live](https://alifcloud.vercel.app)**

> _(Replace the link above with your actual Vercel URL)_

<br/>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **File Manager** | Upload, rename, delete, preview files with ease |
| 🖼️ **Multi-format Support** | PDFs, images, videos, documents — all supported |
| ⭐ **Starred Files** | Bookmark your most important files for quick access |
| 🗑️ **Trash System** | 30-day auto-delete with safe restore |
| 🔗 **Shareable Links** | Generate expiring public share links in one click |
| 📊 **Analytics Dashboard** | Visual charts showing your storage usage over time |
| 🔒 **Secure Auth** | Email login + optional Google OAuth via Supabase |
| 🌙 **Dark Mode** | Beautiful dark-first design — easy on the eyes |
| 📱 **Responsive** | Fully functional on desktop, tablet, and mobile |
| 🛡️ **Private Mode** | Lock signups after setup — only you can access it |

<br/>

---

## 🏗️ Tech Stack

```
┌──────────────────┬──────────────────────────────────┐
│  Frontend        │  Next.js 14 + TypeScript          │
│  Styling         │  Tailwind CSS + Framer Motion      │
│  Backend         │  Supabase (Auth + DB + Storage)    │
│  Database        │  PostgreSQL (via Supabase)         │
│  File Storage    │  Supabase Storage                  │
│  Charts          │  Recharts                          │
│  File Upload     │  React Dropzone                    │
│  Deployment      │  Vercel                            │
└──────────────────┴──────────────────────────────────┘
```

<br/>

---

## 📁 Project Structure

```
alif-cloud/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          ← Login page
│   │   │   └── signup/page.tsx         ← Signup page
│   │   ├── (dashboard)/
│   │   │   ├── files/page.tsx          ← Main file manager
│   │   │   ├── starred/page.tsx        ← Starred files
│   │   │   ├── trash/page.tsx          ← Recycle bin
│   │   │   ├── shared/page.tsx         ← Share links
│   │   │   ├── analytics/page.tsx      ← Usage charts
│   │   │   └── settings/page.tsx       ← User settings
│   │   ├── share/[token]/page.tsx      ← Public share page
│   │   ├── api/download/route.ts       ← Download API
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── files/
│   │       └── FilesClient.tsx
│   └── lib/
│       ├── supabase/client.ts
│       ├── supabase/server.ts
│       ├── utils/index.ts
│       └── types/index.ts
├── supabase-schema.sql
├── .env.example
├── next.config.mjs
└── package.json
```

<br/>

---

## ⚡ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/alif6280/alif-cloud.git
cd alif-cloud
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Open **SQL Editor** → paste `supabase-schema.sql` → **Run**
3. Go to **Authentication → Providers** → Enable Google *(optional)*
4. Go to **Project Settings → API** → Copy your credentials

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

<br/>

---

## 🌐 Deploy to Vercel

```
1. Push this project to GitHub
2. Go to vercel.com → "Import Project"
3. Select your repo
4. Add environment variables:
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy!
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

<br/>

---

## 🛡️ Lock Down for Personal Use

Once you've created your account, disable public signups:

```
Supabase Dashboard
  → Authentication
  → Settings
  → Disable "Enable Sign Ups"
```

Now only you can log in. Your cloud. Your rules.

<br/>

---

## 🔧 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

<br/>

---

## 📄 License

MIT License — open source and free to use.

<br/>

---

<div align="center">

Built with ❤️ by **alif6280**

☁️ **Alif Cloud** — *Your files. Your server. Your rules.*

<br/>

<img src="https://img.shields.io/badge/Made%20with-Next.js-000?style=flat-square&logo=nextdotjs"/>
<img src="https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=flat-square&logo=supabase"/>
<img src="https://img.shields.io/badge/Styled%20with-Tailwind-38BDF8?style=flat-square&logo=tailwindcss"/>

</div>
