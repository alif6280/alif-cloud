<div align="center">

<br/>

```
    ___    __    _______   ______  __    ____  __  _______ 
   /   |  / /   /  _/ __| / ____/ / /   / __ \/ / / / __ \
  / /| | / /    / // /_  / /     / /   / / / / / / / / / /
 / ___ |/ /____/ // __/ / /___  / /___/ /_/ / /_/ / /_/ / 
/_/  |_/_____/___/_/    \____/ /_____/\____/\____/_____/  
```

<br/>

<img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white"/>

<br/><br/>

> ### ☁️ Your personal cloud. Beautifully crafted. Infinitely yours.

<br/>

</div>

---

## ✨ What is Alif Cloud?

**Alif Cloud** is a full-featured, self-hosted personal cloud storage system — built with modern web technologies and designed with a clean, dark-mode-first aesthetic. Upload files, star them, share them, and never worry about losing them again.

Think of it as **your own private Google Drive** — but you own everything, forever.

<br/>

---

## 🚀 Core Features

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
┌─────────────────────────────────────────────────────┐
│                    ALIF CLOUD STACK                 │
├──────────────────┬──────────────────────────────────┤
│  Frontend        │  Next.js 14 + TypeScript         │
│  Styling         │  Tailwind CSS + Framer Motion     │
│  Backend         │  Supabase (Auth + DB + Storage)   │
│  Database        │  PostgreSQL (via Supabase)        │
│  File Storage    │  Supabase Storage                 │
│  Charts          │  Recharts                         │
│  File Upload     │  React Dropzone                   │
│  Deployment      │  Vercel                           │
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
│   │   │   ├── login/page.tsx          ← 🔐 Login page
│   │   │   └── signup/page.tsx         ← 📝 Signup page
│   │   ├── (dashboard)/
│   │   │   ├── files/page.tsx          ← 📁 Main file manager
│   │   │   ├── starred/page.tsx        ← ⭐ Starred files
│   │   │   ├── trash/page.tsx          ← 🗑️ Recycle bin
│   │   │   ├── shared/page.tsx         ← 🔗 Share links
│   │   │   ├── analytics/page.tsx      ← 📊 Usage charts
│   │   │   └── settings/page.tsx       ← ⚙️ User settings
│   │   ├── share/[token]/page.tsx      ← 🌐 Public share page
│   │   ├── api/download/route.ts       ← 📥 Download API
│   │   └── layout.tsx                  ← 🧱 Root layout
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx             ← 🗂️ Navigation sidebar
│   │   │   └── TopBar.tsx              ← 🔝 Top navigation bar
│   │   └── files/
│   │       └── FilesClient.tsx         ← 📂 File manager UI
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts               ← 🔌 Client-side Supabase
│       │   └── server.ts               ← 🖥️ Server-side Supabase
│       ├── utils/index.ts              ← 🛠️ Utility functions
│       └── types/index.ts              ← 🏷️ TypeScript types
├── supabase-schema.sql                 ← 🗄️ Database schema
├── .env.example                        ← 🔑 Environment template
├── next.config.mjs                     ← ⚙️ Next.js config
├── tailwind.config.ts                  ← 🎨 Tailwind config
└── package.json                        ← 📦 Dependencies
```

<br/>

---

## ⚡ Quick Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/yourusername/alif-cloud.git
cd alif-cloud
```

### Step 2 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Open **SQL Editor** → paste `supabase-schema.sql` → **Run**
3. Go to **Authentication → Providers** → Enable Google *(optional)*
4. Go to **Project Settings → API** → Copy your credentials

### Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### Step 4 — Install & run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) 🎉

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
5. Click Deploy!
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

<br/>

---

## 🛡️ Lock Down for Personal Use

Once you've created your account, you can prevent anyone else from signing up:

```
Supabase Dashboard
  → Authentication
  → Settings
  → Disable "Enable Sign Ups"
```

Now only you can log in. Your cloud. Your rules. 🔒

<br/>

---

## 🔧 Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

<br/>

---

## 📦 Key Dependencies

```json
{
  "next": "14.2.15",
  "@supabase/supabase-js": "^2.45.4",
  "@supabase/ssr": "^0.5.1",
  "framer-motion": "^11.11.11",
  "lucide-react": "^0.454.0",
  "recharts": "^2.13.0",
  "react-dropzone": "^14.3.5",
  "tailwindcss": "^3.4.1",
  "typescript": "^5"
}
```

<br/>

---

## 🗄️ Database Schema

The `supabase-schema.sql` file sets up:

- `files` table — stores file metadata (name, size, type, path, owner)
- `shared_links` table — manages public share tokens with expiry dates
- Row Level Security (RLS) — ensures users can only access their own files
- Storage bucket — configures Supabase Storage for file uploads

<br/>

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo
git checkout -b feature/amazing-feature
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
# Open a Pull Request
```

<br/>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<br/>

---

<div align="center">

**Built by MD. Montasir Monir Alif**

☁️ **Alif Cloud** — *Your files. Your server. Your rules.*

<br/>

<img src="https://img.shields.io/badge/Made%20with-Next.js-000?style=flat-square&logo=nextdotjs"/>
<img src="https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E?style=flat-square&logo=supabase"/>
<img src="https://img.shields.io/badge/Styled%20with-Tailwind-38BDF8?style=flat-square&logo=tailwindcss"/>

</div>
