# 🏠 Leenout

> **Leenout** is a discoverable, permission-gated collaborative coding platform for strangers. Users browse live projects, request access, and contribute to real codebases in real-time — without needing to know the owner beforehand.
>
> *Leaning out of your window to see what is being built next door, deciding to walk over and help.*

---

## 🚀 Key Features

* **🚪 Gated Workspace Access**: Strangers browse live projects, review open roles or current blockers, and pitch access requests. Project owners retain absolute sovereign approval control.
* **⏱️ Scheduled Edit Windows & Live Countdown HUD**: Contributor editing is coordinated by strict, scheduled timeslots. A floating circular SVG countdown HUD tracks active session locks with micro-animated pulse/ping alerts under 5 minutes.
* **💻 Monaco Code Editor & Live Preview**: Real-time in-browser code editor powered by Monaco Editor (VSCode engine) with integrated file directory trees and a sandboxed HTML/CSS/JS preview container.
* **🛡️ Hardened Security Isolation Sandbox**: The preview compiler compiles code in a restricted browser frame using `sandbox="allow-scripts"` strictly (**removing the `allow-same-origin` vulnerability**), isolating visitor code execution from root document resources, session cookies, and database auth claims.
* **💬 Multiplayer Room Chat**: Real-time collaborative chat rooms mapping authenticated developer identities, custom visual badges (`Owner` / `Contributor`), and sanitized payloads.
* **📝 Edit History Reverts**: Active owner console logging previous session code diff snapshots, granting owners the ability to perform full cascade file reverts.
* **📂 Granular File-Level Permissions**: Owners restrict active contributors to specific files or modules (e.g. `allowed_files: ["src/index.css"]`), locked securely via PostgreSQL Row Level Security (RLS).
* **🔨 Kick & 7-Day Cooldowns**: Owners can evict contributors instantly, locking them out of future pitches for 7 days via database-enforced triggers.
* **📋 Dedicated Support & Moderation Route**: Embedded `/support` page rendering the platform's official Google Form under a premium, dark-mode container for rapid ticketing, harassment reporting, and abuse moderation.
* **🟩 Visual Cascade Account Purge**: Simulated green/orange monochrome terminal purge logging cascading database deletion events in real-time during profile removals.

---

## 🛠️ Technical Stack

### Frontend
* **Core Framework**: Next.js 16 (App Router, Turbopack Compiler)
* **Styling**: Vanilla CSS with unified HSL elegant Dark-Gray styling (`#0a0a0a` & `#111111`)
* **State Management**: Zustand
* **Editor Base**: Monaco Editor Wrapper
* **WebSockets**: Socket.io-client

### Backend & Database
* **Server**: Node.js + Express
* **Real-time Protocol**: Socket.io Rooms
* **Database**: PostgreSQL (Supabase DB) with Row Level Security (RLS)
* **Authentication**: Supabase Auth (GitHub OAuth & JWT token verifications)
* **Email Routing**: Resend API

---

## 📂 Folder Architecture

```bash
leenout/
├── .gitignore               # Global root-level git safeguards
├── README.md                # General developer documentation
├── backend/                 # Node.js + Express API & Socket.io server container
│   ├── src/                 # Server logic, rate-limiters, & whitelists
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Next.js App Router Client Portal
│   ├── src/
│   │   ├── app/             # Application routes (Discovery, Workspace Studio, Support)
│   │   ├── components/      # UI widgets (Glassmorphic Project Cards, Auth Navs)
│   │   └── utils/           # Supabase client helpers & states
│   └── package.json
├── supabase/                # PostgreSQL Database Infrastructure
│   └── migrations/          # RLS policies, schemas, and cooldown triggers
└── PRD & TRD/               # Product Requirements Documents (Git Ignored)
```

---

## 🏁 Quickstart Guide

### Prerequisite Environment Variables

#### `/backend/.env`
```env
PORT=4000
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

* **Zero-Trust Token Gating**: Backend requests and WebSocket handshakes enforce cryptographic validation of user JWT claims directly via Supabase Auth APIs.
* **Fail-Closed API Keys**: Administrative backend routines fall back gracefully to simulation blocks in local settings if private environment keys are absent.
* **Rate Limiting**: Sliding-window IP and account-based rate limiters protect secure paths (`/api/delete-account`, `/api/projects/:id/fork`, and access requests) from dictionary attacks or denial-of-service abuse.
* **Strict Parameters Whitelisting**: Body schemas enforce pre-compiled UUID types, string sanitization, and block parameter pollution.
* **Abuse Reporting**: Any copyright infractions, code exploits, or chat harassment can be reported directly via the `/support` panel for rapid moderation action.
