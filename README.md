<div align="center">

<img src="./banner.svg" width="100%" alt="Alif Cloud Banner"/>

<br/>

<a href="https://alifcloud.vercel.app">
  <img src="https://img.shields.io/badge/🚀%20LIVE%20DEMO-alifcloud.vercel.app-ffffff?style=for-the-badge&labelColor=6d28d9&color=4c1d95"/>
</a>

<br/><br/>

<img src="https://img.shields.io/badge/Next.js-14-ffffff?style=for-the-badge&logo=nextdotjs&logoColor=white&labelColor=000000&color=18181b"/>
<img src="https://img.shields.io/badge/TypeScript-5.0-ffffff?style=for-the-badge&logo=typescript&logoColor=white&labelColor=1e3a5f&color=3178C6"/>
<img src="https://img.shields.io/badge/Supabase-Backend-ffffff?style=for-the-badge&logo=supabase&logoColor=white&labelColor=1a4731&color=3ECF8E"/>
<img src="https://img.shields.io/badge/Tailwind-3.4-ffffff?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0c4a6e&color=38BDF8"/>
<img src="https://img.shields.io/badge/Vercel-Deployed-ffffff?style=for-the-badge&logo=vercel&logoColor=white&labelColor=111111&color=333333"/>

<br/><br/>

<img src="https://img.shields.io/badge/MIT-License-a78bfa?style=flat-square&labelColor=2e1065"/>
<img src="https://img.shields.io/badge/PRs-Welcome-34d399?style=flat-square&labelColor=064e3b"/>
<img src="https://img.shields.io/badge/Status-Active-fbbf24?style=flat-square&labelColor=451a03"/>
<img src="https://img.shields.io/badge/Version-1.0.0-c084fc?style=flat-square&labelColor=3b0764"/>

<br/><br/>

> **💜 Your own private Google Drive — but you own everything, forever.**

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━%20📌%20TABLE%20OF%20CONTENTS%20━━━━━━-4c1d95?style=for-the-badge" width="100%"/>

<br/>

&nbsp;&nbsp;&nbsp;[✨ Features](#-features) &nbsp;•&nbsp;
[🏗️ Tech Stack](#️-tech-stack) &nbsp;•&nbsp;
[📁 Project Structure](#-project-structure) &nbsp;•&nbsp;
[⚡ Quick Start](#-quick-start) &nbsp;•&nbsp;
[🌐 Deploy](#-deploy-to-vercel) &nbsp;•&nbsp;
[🛡️ Private Mode](#️-lock-down-for-personal-use) &nbsp;•&nbsp;
[📄 License](#-license)

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20✨%20FEATURES%20━━━━━━━━-7c3aed?style=for-the-badge" width="100%"/>

<br/>

<div align="center">

| &nbsp;Icon&nbsp; | Feature | Description |
|:---:|:---|:---|
| 📁 | **File Manager** | Upload, rename, delete & preview files with ease |
| 🖼️ | **Multi-format Support** | PDFs, images, videos, documents — all in one place |
| ⭐ | **Starred Files** | Bookmark your most important files for quick access |
| 🗑️ | **Trash System** | 30-day auto-delete with safe one-click restore |
| 🔗 | **Shareable Links** | Generate expiring public share links instantly |
| 📊 | **Analytics Dashboard** | Visual charts showing your storage usage over time |
| 🔒 | **Secure Auth** | Email login + Google OAuth via Supabase |
| 🌙 | **Dark Mode** | Sleek dark-first design — easy on the eyes |
| 📱 | **Fully Responsive** | Seamless experience on desktop, tablet & mobile |
| 🛡️ | **Private Mode** | Lock signups after setup — only you can access it |

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20🏗️%20TECH%20STACK%20━━━━━━━━-6d28d9?style=for-the-badge" width="100%"/>

<br/>

<div align="center">

<img src="https://img.shields.io/badge/⚛️%20Frontend-Next.js%2014%20%2B%20TypeScript-a78bfa?style=for-the-badge&labelColor=1e1b4b"/>
<img src="https://img.shields.io/badge/🎨%20Styling-Tailwind%20CSS%20%2B%20Framer%20Motion-818cf8?style=for-the-badge&labelColor=1e1b4b"/>

<br/>

<img src="https://img.shields.io/badge/🔧%20Backend-Supabase%20Auth%20%2B%20DB%20%2B%20Storage-34d399?style=for-the-badge&labelColor=022c22"/>
<img src="https://img.shields.io/badge/🗄️%20Database-PostgreSQL%20via%20Supabase-4ade80?style=for-the-badge&labelColor=022c22"/>

<br/>

<img src="https://img.shields.io/badge/📈%20Charts-Recharts-38bdf8?style=for-the-badge&labelColor=0c1a2e"/>
<img src="https://img.shields.io/badge/📂%20Upload-React%20Dropzone-7dd3fc?style=for-the-badge&labelColor=0c1a2e"/>
<img src="https://img.shields.io/badge/🚀%20Deploy-Vercel-e2e8f0?style=for-the-badge&labelColor=111111"/>

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━%20📁%20PROJECT%20STRUCTURE%20━━━━━━-5b21b6?style=for-the-badge" width="100%"/>

<br/>

```
☁️ alif-cloud/
│
├── 📂 src/
│   ├── 📂 app/
│   │   ├── 🔐 (auth)/
│   │   │   ├── login/page.tsx          ← Login page
│   │   │   └── signup/page.tsx         ← Signup page
│   │   │
│   │   ├── 📊 (dashboard)/
│   │   │   ├── files/page.tsx          ← Main file manager
│   │   │   ├── starred/page.tsx        ← Starred files
│   │   │   ├── trash/page.tsx          ← Recycle bin
│   │   │   ├── shared/page.tsx         ← Share links manager
│   │   │   ├── analytics/page.tsx      ← Storage usage charts
│   │   │   └── settings/page.tsx       ← User settings
│   │   │
│   │   ├── 🔗 share/[token]/page.tsx   ← Public share page
│   │   ├── ⬇️ api/download/route.ts    ← Secure download API
│   │   └── layout.tsx
│   │
│   ├── 🧩 components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── layout/TopBar.tsx
│   │   └── files/FilesClient.tsx
│   │
│   └── 📚 lib/
│       ├── supabase/client.ts
│       ├── supabase/server.ts
│       ├── utils/index.ts
│       └── types/index.ts
│
├── 🗄️ supabase-schema.sql              ← Database schema
├── ⚙️ .env.example
├── ⚙️ next.config.mjs
└── 📦 package.json
```

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20⚡%20QUICK%20START%20━━━━━━━━-7c3aed?style=for-the-badge" width="100%"/>

<br/>

> **Prerequisites:** Node.js `18+` &nbsp;|&nbsp; A free [Supabase](https://supabase.com) account

<br/>

**`Step 1`** — Clone the repository

```bash
git clone https://github.com/alif6280/alif-cloud.git
cd alif-cloud
```

**`Step 2`** — Set up Supabase

```
1. Go to supabase.com → New Project
2. SQL Editor → paste supabase-schema.sql → Run
3. Authentication → Providers → Enable Google (optional)
4. Project Settings → API → Copy your credentials
```

**`Step 3`** — Configure environment variables

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

**`Step 4`** — Install & run

```bash
npm install
npm run dev
```

<div align="center">

🎉 Open **[http://localhost:3000](http://localhost:3000)** — your cloud is ready!

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20🌐%20DEPLOY%20TO%20VERCEL%20━━━━━━━━-4c1d95?style=for-the-badge" width="100%"/>

<br/>

```
1.  Push this project to GitHub
2.  Go to vercel.com → "Add New Project"
3.  Import your repository
4.  Add environment variables:
       NEXT_PUBLIC_SUPABASE_URL
       NEXT_PUBLIC_SUPABASE_ANON_KEY
5.  Hit Deploy! 🚀
```

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alif6280/alif-cloud)

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━%20🛡️%20LOCK%20DOWN%20FOR%20PERSONAL%20USE%20━━━━━━-6d28d9?style=for-the-badge" width="100%"/>

<br/>

Once you've created your account, prevent anyone else from signing up:

```
Supabase Dashboard
  → Authentication
  → Settings
  → Disable "Enable Sign Ups"
```

<div align="center">

> 🔐 **Now only you can log in. Your cloud. Your rules.**

</div>

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20🔧%20SCRIPTS%20━━━━━━━━-5b21b6?style=for-the-badge" width="100%"/>

<br/>

```bash
npm run dev       # 🔥 Start development server  →  localhost:3000
npm run build     # 📦 Build for production
npm run start     # 🚀 Start production server
npm run lint      # 🔍 Run ESLint checks
```

<br/>

<!-- ════════════════════════════════════════════════════ -->

<img src="https://img.shields.io/badge/━━━━━━━━%20📄%20LICENSE%20━━━━━━━━-4c1d95?style=for-the-badge" width="100%"/>

<br/>

This project is licensed under the **MIT License** — free to use, modify, and distribute.

See the [LICENSE](./LICENSE) file for details.

<br/>

<!-- ════════════════════════════════════════════════════ -->

<div align="center">

<img src="https://img.shields.io/badge/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━-4c1d95?style=for-the-badge" width="100%"/>

<br/>

**Built with 💜 by [alif6280](https://github.com/alif6280)**

<br/>

<img src="https://img.shields.io/badge/Made%20with-Next.js-a78bfa?style=flat-square&logo=nextdotjs&labelColor=1e1b4b"/>
&nbsp;
<img src="https://img.shields.io/badge/Powered%20by-Supabase-34d399?style=flat-square&logo=supabase&labelColor=022c22"/>
&nbsp;
<img src="https://img.shields.io/badge/Styled%20with-Tailwind-38bdf8?style=flat-square&logo=tailwindcss&labelColor=0c1a2e"/>

<br/><br/>

☁️ **Alif Cloud** — *Your files. Your server. Your rules.*

<br/>

⭐ **If you find this useful, please consider giving it a star!** ⭐

</div>
