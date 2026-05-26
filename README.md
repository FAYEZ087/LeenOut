![Leenout banner](./frontend/Logo.png)

# 🏠 Leenout

> **Leenout** is a discoverable, permission-gated collaborative coding platform for strangers. Users browse live projects, request access, and contribute to real codebases in real-time — without needing to know the owner beforehand.
>
> *Leaning out of your window to see what is being built next door, deciding to walk over and help.*

---

## 🚀 Key Features

* **🏪 Discovery Marketplace**: Browse public workspaces, filter by stack/roles, watch projects, and submit collaboration pitches.
* **✅ Owner Control Center**: Approve/deny requests, manage contributors, set file-level permissions, schedule timed edit windows, kick with cooldowns, and revert file snapshots.
* **💻 Live Studio Workspace**: Monaco editor + file tree with Ctrl/Cmd+S commits and real-time HTML/CSS/JS preview compilation.
* **🔒 Timed Edit Windows + Countdown HUD**: Contributor edits are gated by active windows; a floating countdown overlay shows remaining time and allowed scope.
* **💬 Real-time Collaboration**: Socket.io chat with room history plus live file update broadcasts.
* **🧪 Sandboxed Preview**: Rendered in an iframe using `sandbox="allow-scripts"` for strict isolation.
* **🔁 Forking & Watchlists**: Fork public projects and track watched workspaces.
* **🧾 Profile + Support**: Developer card management, simulated cascade delete flow, and a dedicated `/support` form.

---

## 🛠️ Technical Stack

### Frontend
* **Core Framework**: Next.js 16 (App Router) + React 19
* **Styling**: Tailwind CSS v4 with design tokens in `globals.css`
* **Editor Base**: Monaco Editor (`@monaco-editor/react`)
* **WebSockets**: Socket.io-client
* **Auth/DB Client**: Supabase JS

### Backend & Database
* **Server**: Node.js + Express (TypeScript)
* **Real-time Protocol**: Socket.io
* **Database**: Supabase Postgres with Row Level Security (RLS)
* **Authentication**: Supabase Auth (JWT sessions)
* **API Surface**: `/health`, `/api/notify-request`, `/api/delete-account`, `/api/projects/:id/fork`

---

## 📂 Folder Architecture

```bash
leenout/
├── .gitignore               # Global root-level git safeguards
├── README.md                # General developer documentation
├── backend/                 # Express + Socket.io API server (TypeScript)
│   ├── src/                 # HTTP endpoints, socket handlers, rate limits
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js App Router UI
│   ├── src/
│   │   ├── app/             # Routes (marketplace, studio, dashboard, support)
│   │   ├── components/      # UI widgets
│   │   └── utils/           # Supabase client helpers
│   └── package.json
├── supabase/                # Database schema + RLS policies
│   └── migrations/
└── PRD & TRD/               # Product Requirements Documents (Git ignored)
```

---

## 🏁 Quickstart Guide

### Prerequisite Environment Variables

#### `/backend/.env`
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-private-service-role-key
```

#### `/frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-public-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

> **Note:** Placeholder keys let the app boot locally, but data/auth features are limited. Use real Supabase credentials for full functionality and RLS enforcement.

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

* **RLS-first enforcement**: Supabase policies lock down projects, files, edit windows, and allowed file scopes.
* **JWT-backed access checks**: API endpoints and Socket.io handshakes validate Supabase sessions when configured.
* **Rate Limiting**: Sliding-window limits protect sensitive routes such as account deletion and project forking.
* **Strict Payload Validation**: Whitelisted request schemas sanitize and reject unexpected fields.
* **Abuse Reporting**: The `/support` form provides a direct moderation channel.
