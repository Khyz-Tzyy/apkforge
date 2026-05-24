# APKForge

> Build Flutter APKs straight from your browser. No setup required.
> **A Khyz Project** — Early Development

---

## About

APKForge is a web-based Flutter APK builder. Write Flutter code, configure your build, and download your APK — all from your browser without installing anything locally.

## Features

- Web-based Flutter code editor with file tree
- Real-time build logs
- APK decompiler & analyzer
- Project management
- Admin panel
- Free during early access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend (planned) | Node.js + Railway |
| Database (planned) | Supabase |
| Build Engine (planned) | GitHub Actions |
| Storage (planned) | Cloudflare R2 |
| Auth (planned) | Supabase Auth |

## Project Structure

```
apkforge/
├── index.html
├── pages/
│   ├── login.html
│   ├── dashboard.html
│   ├── editor.html
│   ├── projects.html
│   ├── analyzer.html
│   ├── admin/
│   │   ├── index.html
│   │   ├── users.html
│   │   └── builds.html
│   ├── css/
│   │   ├── global.css
│   │   ├── landing.css
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── editor.css
│   │   ├── projects.css
│   │   ├── analyzer.css
│   │   └── admin.css
│   └── js/
│       ├── core/
│       │   ├── auth.js
│       │   └── router.js
│       ├── dashboard.js
│       ├── editor.js
│       ├── projects.js
│       ├── analyzer.js
│       ├── build.js
│       └── admin.js
└── assets/
    ├── icons/
    └── fonts/
```

## Free Plan Limits

- 7 builds per 2 days
- APK stored for 7 days (auto-deleted after)
- 2 APK analyzes per day

## Deployment

- Frontend: [Vercel](https://vercel.com)
- Push to GitHub → Vercel auto-deploys

## Status

> Early development. Backend not connected yet. UI is complete and ready for backend integration.

## Developer

Made with love by **Khyz Project**

---

© 2025 APKForge — A Khyz Project
