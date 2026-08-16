<img src="./frontend/Logo.png" alt="Leenout banner" width="100%" />

# 🏠 Leenout

> **Leenout** is a discoverable, permission-gated collaborative coding platform for strangers. Users browse live projects, request access, and contribute to real codebases in real-time — without needing to know the owner beforehand.
>
> *Leaning out of your window to see what is being built next door, deciding to walk over and help.*

---

## 🚀 Key Features

* **🏪 Discovery Marketplace**: Browse public workspaces, filter by stack/roles, watch projects, and submit collaboration pitches.
* **🏆 Speed-Run Hackathon & Challenge Hub (`/challenges`)**: Competitive coding arena with timed sprints, test suite evaluations, and a live global leaderboard.
* **🌿 Session Branching & Visual Diff Merge**: Contributor edit sessions save into draft branches for owner side-by-side diff review and 1-click **Approve & Merge** or **Reject**.
* **🙈 Selective File Masking ("Zero-Trust")**: Project owners can mask sensitive backend/config files while contributors edit frontend code without seeing hidden source code.
* **📺 Studio Cast (Live Spectator Mode)**: Owners can broadcast live coding streams with real-time floating emoji reactions (🔥, ❤️, 👍, 🚀).
* **💰 Snippet Micro-Bounties**: File-level tasks with rewards that contributors can claim and fulfill.
* **🔑 Pre-Commit Secret Scanner**: Automatically scans code prior to saves for exposed Stripe keys, AWS access tokens, RSA keys, and JWTs, blocking unsafe commits.
* **🔊 Dev Hype Web Audio SFX**: Browser-synthesized audio feedback for commits, branch merges, and security alerts.
* **🌐 Polyglot Chat Translation**: Real-time multi-lingual translation helpers for project chat.
* **🐙 One-Click Export to GitHub PR & Release Notes**: Export session branches directly to GitHub Pull Requests and auto-generate changelogs.
* **📊 Developer Contribution Heatmap Analytics**: 52-week activity grid on developer profiles.
* **🛡️ Trust & Support Portal (`/support`)**: Live system status indicator, interactive ticket submission form, developer FAQ accordions, and updated v2.0 legal policies.

---

## 🛠️ Technical Stack

### Frontend
* **Core Framework**: Next.js 16 (App Router) + React 19
* **Styling**: Tailwind CSS v4 with design tokens in `globals.css`
* **Editor Base**: Monaco Editor (`@monaco-editor/react`)
* **Real-time Hook**: `useProjectSocket` custom hook for lifecycle management
* **WebSockets**: Socket.io-client
* **Audio Synth**: Web Audio API (`soundEffects.ts`)
* **Auth/DB Client**: Supabase JS (`supabaseClient.ts`)

### Backend & Database
* **Server**: Node.js + Express (TypeScript)
* **Real-time Protocol**: Socket.io
* **Rate Limiting**: `express-rate-limit` middleware (global & strict route protection)
* **Database**: Supabase Postgres with Row Level Security (RLS) & composite foreign key indexes
* **Authentication**: Supabase Auth (JWT sessions)
* **API Surface**: `/health`, `/api/notify-request`, `/api/delete-account`, `/api/projects/:id/fork`, `/api/projects/:id/github-pr`, `/api/projects/:id/release-notes`

---

## 📂 Folder Architecture

```bash
leenout/
├── .gitignore               # Global root-level git safeguards
├── README.md                # General developer documentation
├── backend/                 # Express + Socket.io API server (TypeScript)
│   ├── .env.example         # Backend environment variables template
│   ├── src/                 # HTTP endpoints, socket handlers, rate limits
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js App Router UI
│   ├── .env.example         # Frontend environment variables template
│   ├── src/
│   │   ├── app/             # Routes (marketplace, studio, dashboard, challenges, support, legals)
│   │   ├── components/      # UI widgets (AuthNav, LayoutClient)
│   │   ├── hooks/           # Custom hooks (useProjectSocket)
│   │   └── utils/           # Supabase client, secretScanner, soundEffects, chatTranslator
│   └── package.json
├── supabase/                # Database schema + RLS policies
│   └── migrations/          # SQL migrations (RLS, indexes, challenges, bounties, session_branches)
```

---

## 🏁 Quickstart Guide

### Prerequisite Environment Variables

#### `/backend/.env` (See `.env.example`)
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-private-service-role-key
```

#### `/frontend/.env.local` (See `.env.example`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

### Installation Steps

1. **Clone & Install Dependencies**
   ```bash
   # Install Backend dependencies
   cd backend
   npm install

   # Install Frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Initialize Database Schema**
   Apply the migrations located in `/supabase/migrations/` to your Supabase Postgres database.

3. **Start Development Environments**
   ```bash
   # Run Express & Sockets API
   cd backend
   npm run dev

   # Run Next.js 16 Web app
   cd ../frontend
   npm run dev
   ```

4. **Verify Production Compilation Build**
   ```bash
   # Compile Backend TypeScript
   cd backend
   npm run build

   # Compile & Optimize Next.js Web App
   cd ../frontend
   npm run build
   ```

---

## 🔒 Security & Moderation Guidelines

* **RLS-first enforcement**: Supabase policies lock down projects, files, edit windows, bounties, and session branches.
* **Pre-Commit Secret Scanner**: Scans Monaco editor saves for hardcoded API keys, JWTs, and RSA keys prior to commits.
* **Selective File Masking**: Owners can mask sensitive backend/env files from non-owner contributors.
* **Express Rate Limiting**: Sliding-window rate limiters protect sensitive endpoints from brute-force attempts.
* **JWT-backed access checks**: API endpoints and Socket.io handshakes validate Supabase sessions.
* **Interactive Support Hub**: The `/support` portal provides real-time system status and ticket routing.
