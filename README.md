<div align="center">

<br/>

<h1>☁️ ALIF CLOUD</h1>

<h3>Your Personal Cloud Storage — Beautiful, Fast & Secure</h3>

<br/>

<img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white"/>

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
| 🛡️ **Admin Panel** | Full admin control — manage users, storage, and access |
| 📧 **Email Whitelist** | Restrict signups to allowed emails only |

<br/>

---

## 🛡️ Admin Panel

Alif Cloud includes a powerful built-in Admin Panel at `/admin`.

| Feature | Description |
|---|---|
| 📊 **Overview** | Total users, files, storage, and allowed emails at a glance |
| 👥 **User Management** | View all users, block/unblock, promote/demote admin, delete |
| 💾 **Storage Quota** | Edit per-user storage quota directly from the panel |
| 📧 **Allowed Emails** | Whitelist emails — only listed addresses can sign up |
| 🔐 **Secure Access** | Admin routes protected by server-side role verification |

### How the Email Whitelist Works

- **List is empty** → Anyone can sign up freely
- **List has emails** → Only those exact emails can sign up
- **Email not in list** → Signup is blocked with an error

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
│   │   │   ├── login/page.tsx              ← Login page
│   │   │   └── signup/page.tsx             ← Signup page (whitelist checked)
│   │   ├── (dashboard)/
│   │   │   ├── files/page.tsx              ← Main file manager
│   │   │   ├── starred/page.tsx            ← Starred files
│   │   │   ├── trash/page.tsx              ← Recycle bin
│   │   │   ├── shared/page.tsx             ← Share links
│   │   │   ├── analytics/page.tsx          ← Usage charts
│   │   │   └── settings/page.tsx           ← User settings
│   │   ├── admin/
│   │   │   ├── page.tsx                    ← Admin overview
│   │   │   ├── users/page.tsx              ← User management
│   │   │   └── emails/page.tsx             ← Email whitelist
│   │   ├── api/
│   │   │   ├── admin/users/route.ts        ← Admin user actions API
│   │   │   └── download/route.ts           ← File download API
│   │   ├── share/[token]/page.tsx          ← Public share page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── files/
│   │       └── FilesClient.tsx
│   └── lib/
│       ├── supabase/client.ts
│       ├── supabase/server.ts              ← createClient + createAdminClient
│       ├── utils/index.ts
│       └── types/index.ts
├── src/middleware.ts                       ← Admin route protection
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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is required for the Admin Panel to work.
> Find it at: Supabase Dashboard → Settings → API → `service_role`

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
     SUPABASE_SERVICE_ROLE_KEY
5. Deploy!
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

<br/>

---

## 🗄️ Supabase RLS Policies

For the admin panel and email whitelist to work correctly, run these policies in your Supabase SQL Editor:

```sql
-- Allow anyone to read allowed_emails (for signup check)
CREATE POLICY "Anyone can check allowed emails"
  ON allowed_emails FOR SELECT USING (true);

-- Only admins can manage allowed_emails
CREATE POLICY "Admins manage allowed emails"
  ON allowed_emails FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

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