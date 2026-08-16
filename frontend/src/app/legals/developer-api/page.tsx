"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Terminal, Cpu, Check, Copy, AlertTriangle, Key, Zap } from "lucide-react";

export default function DeveloperApiPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 bg-bg px-6 py-16 relative overflow-hidden font-mono selection:bg-accent selection:text-bg">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Navigation back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase font-bold bg-transparent border-none p-0 cursor-pointer mb-8 select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="border-b border-border pb-8 mb-12 select-none">
          <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent/5 px-3.5 py-1 mb-4 text-[10px] uppercase tracking-wider text-accent font-semibold">
            <Cpu className="h-3.5 w-3.5" />
            <span>Developer Center</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Developer <span className="text-accent">API</span>
          </h1>
          <p className="text-xs text-text-muted">
            Integrate Leenout's real-time developer roster metrics and active scheduled workspace alerts directly.
          </p>
          <p className="text-xs text-text-muted mt-2">
            Last updated: August 15, 2026 &bull; Developer API Specification v2.0
          </p>
        </div>

        {/* Security Warning Gating Box */}
        <div className="bg-accent2/5 border border-accent2/25 p-5 mb-10 text-xs text-text-primary leading-relaxed relative overflow-hidden flex items-start gap-4">
          <Key className="h-6 w-6 text-accent2 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-syne uppercase tracking-wider text-accent2 mb-1 font-bold text-[10px]">
              Strict Security Gating: Service Role Policy
            </strong>
            The Supabase Service Role API key allows total RLS bypass. It is restricted strictly to our server container environments (Render/backend). Frontend clients must only ever query public assets using short-lived developer tokens or anon keys.
          </div>
        </div>

        {/* API Specification list */}
        <div className="space-y-16">
          
          {/* Endpoint 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 select-none flex-wrap">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-sm">
                GET
              </span>
              <code className="text-sm font-bold text-text-primary">/health</code>
              <span className="text-xs text-text-muted font-light pl-2">System Diagnostics check</span>
            </div>
            <p className="text-xs text-text-muted">
              Performs rapid health checks on backend core servers. Returns operational flags and dynamic timestamps.
            </p>

            {/* Code Block Container */}
            <div className="relative group bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <button
                onClick={() => copyToClipboard(`curl -X GET ${backendUrl}/health`, "curl-1")}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-opacity cursor-pointer p-1"
                title="Copy Curl Command"
              >
                {copiedId === "curl-1" ? <Check className="h-4 w-4 text-accent animate-bounce" /> : <Copy className="h-4 w-4" />}
              </button>
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Request Curl</span>
              <pre className="text-text-primary">{`curl -X GET ${backendUrl}/health`}</pre>
            </div>

            <div className="bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Response JSON (200 OK)</span>
              <pre className="text-accent">{`{
  "status": "ok",
  "time": "${new Date().toISOString()}"
}`}</pre>
            </div>
          </section>

          {/* Endpoint 2 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 select-none flex-wrap">
              <span className="bg-accent-orange/10 border border-accent-orange/30 text-accent2 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-sm">
                POST
              </span>
              <code className="text-sm font-bold text-text-primary">/api/notify-request</code>
              <span className="text-xs text-text-muted font-light pl-2">Access Pitch Notification</span>
            </div>
            <p className="text-xs text-text-muted">
              Dispatches alerts when stranger developers pitch for active workspace scheduled access. Generates simulation logs on the Express standard output shell.
            </p>

            <div className="relative group bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <button
                onClick={() => copyToClipboard(`curl -X POST ${backendUrl}/api/notify-request \\
  -H "Content-Type: application/json" \\
  -d '{"projectOwnerEmail":"owner@leenout.dev","projectName":"CssMorph","requesterUsername":"alex_styles","message":"Can fix backdrop lag."}'`, "curl-2")}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-opacity cursor-pointer p-1"
                title="Copy Curl Command"
              >
                {copiedId === "curl-2" ? <Check className="h-4 w-4 text-accent animate-bounce" /> : <Copy className="h-4 w-4" />}
              </button>
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Request Curl</span>
              <pre className="text-text-primary">{`curl -X POST ${backendUrl}/api/notify-request \\
  -H "Content-Type: application/json" \\
  -d '{"projectOwnerEmail":"owner@leenout.dev","projectName":"CssMorph","requesterUsername":"alex_styles","message":"Can fix backdrop lag."}'`}</pre>
            </div>

            <div className="bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Response JSON (200 OK)</span>
              <pre className="text-accent">{`{
  "success": true,
  "message": "Notification logged successfully for owner of CssMorph"
}`}</pre>
            </div>
          </section>

          {/* Endpoint 3 */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 select-none flex-wrap">
              <span className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-sm">
                POST
              </span>
              <code className="text-sm font-bold text-text-primary">/api/delete-account</code>
              <span className="text-xs text-text-muted font-light pl-2">Developer Account Deletion</span>
            </div>
            <p className="text-xs text-text-muted">
              Calls secure Supabase Admin Auth endpoints to permanently wipe a developer account. Falls back gracefully to simulation mode in local dev setups to keep logs clean.
            </p>

            <div className="relative group bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <button
                onClick={() => copyToClipboard(`curl -X POST ${backendUrl}/api/delete-account \\
  -H "Content-Type: application/json" \\
  -d '{"userId":"3f49df74-e8ca-4251-9efb-fa3d9b4b9b9a"}'`, "curl-3")}
                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-opacity cursor-pointer p-1"
                title="Copy Curl Command"
              >
                {copiedId === "curl-3" ? <Check className="h-4 w-4 text-accent animate-bounce" /> : <Copy className="h-4 w-4" />}
              </button>
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Request Curl</span>
              <pre className="text-text-primary">{`curl -X POST ${backendUrl}/api/delete-account \\
  -H "Content-Type: application/json" \\
  -d '{"userId":"3f49df74-e8ca-4251-9efb-fa3d9b4b9b9a"}'`}</pre>
            </div>

            <div className="bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Response JSON (200 OK)</span>
              <pre className="text-accent">{`{
  "success": true,
  "message": "Developer profile completely removed."
}`}</pre>
            </div>
          </section>

          {/* Integration Specs */}
          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="font-syne text-lg font-bold text-accent uppercase tracking-wider select-none flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span>Real-Time WebSocket Rooms API</span>
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Leenout exposes rooms over Socket.io protocol at <code>ws://localhost:4000</code>. Clients can join isolated project threads and subscribe to real-time keystroke commits and active warnings:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>Room format:</strong> <code>project:{"{projectId}"}</code></li>
              <li><strong>Broadcasting Saves:</strong> Emitting <code>file_saved</code> synchronizes workspace file caches.</li>
              <li><strong>Studio Cast Streaming:</strong> Emitting <code>toggle_studio_cast</code> broadcasts spectator stream status.</li>
              <li><strong>Shared Console Errors:</strong> Emitting <code>share_console_error</code> highlights preview errors across clients.</li>
            </ul>
          </section>

          {/* New REST Endpoints */}
          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="font-syne text-lg font-bold text-accent uppercase tracking-wider select-none flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span>GitHub PR & Release Notes REST API</span>
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Export draft contributor branches directly to GitHub Pull Requests or generate automated session release notes:
            </p>
            <div className="bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// POST /api/projects/:id/github-pr</span>
              <pre className="text-accent">{`curl -X POST ${backendUrl}/api/projects/proj-123/github-pr \\
  -H "Content-Type: application/json" \\
  -d '{"branchName":"session/dev-12","prTitle":"Feature: Dark Mode Navbar"}'`}</pre>
            </div>
          </section>

          {/* Authentication Protocol */}
          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="font-syne text-lg font-bold text-accent uppercase tracking-wider select-none flex items-center gap-2">
              <Key className="h-4 w-4 text-accent" />
              <span>API Authentication Standards</span>
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              All secure state-modifying requests must transmit a verified Supabase JWT within the request headers. Anonymous requests on protected paths will be dropped at the routing layer:
            </p>
            <div className="bg-surface border border-border p-4 overflow-x-auto text-[11px] font-mono leading-relaxed max-w-full">
              <span className="text-[9px] uppercase tracking-wider text-text-muted block mb-2 select-none">// Request Header Format</span>
              <pre className="text-text-primary">{`Authorization: Bearer <your_supabase_jwt_token>`}</pre>
            </div>
          </section>

          {/* HTTP Response Registry */}
          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="font-syne text-lg font-bold text-accent uppercase tracking-wider select-none flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <span>HTTP Response Registry</span>
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              The Express backend processes requests and registers failures using uniform HTTP status code responses:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>200 OK:</strong> Operation succeeded; response payload is returned.</li>
              <li><strong>400 Bad Request:</strong> Whitelisting schema failure or malformed path UUID parameters.</li>
              <li><strong>401 Unauthorized:</strong> JWT token is missing, expired, or failed verification.</li>
              <li><strong>403 Forbidden:</strong> RLS rule violation; authenticated user does not have owner-issued credentials.</li>
              <li><strong>429 Too Many Requests:</strong> Rate limiting block; response includes a <code>Retry-After</code> header in seconds.</li>
            </ul>
          </section>

          {/* Developer Support & API Feedback */}
          <section className="space-y-4 pt-4 border-t border-border/40">
            <h2 className="font-syne text-lg font-bold text-accent uppercase tracking-wider select-none flex items-center gap-2">
              <Terminal className="h-4 w-4 text-accent" />
              <span>Developer Support & API Feedback</span>
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              If you require assistance integrating our WebSockets, ran into RLS authorization anomalies, or have questions regarding this API documentation, please reach out to us by filing a ticket through our official <a href="/support" className="text-accent hover:underline">Support & Help Form</a>.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/40 mt-16 pt-8 text-center text-[10px] text-text-muted select-none">
          Leenout, Inc. &bull; Developer API Specifications &bull; May 2026
        </div>
      </div>
    </div>
  );
}
