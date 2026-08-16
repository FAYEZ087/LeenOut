"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Lock, AlertCircle } from "lucide-react";

export default function SecurityPolicyPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
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
            <Lock className="h-3.5 w-3.5" />
            <span>Platform Security Standards</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Security <span className="text-accent">Policy</span>
          </h1>
          <p className="text-xs text-text-muted">
            Last updated: August 15, 2026 &bull; Secure Protocol Audit v2.0
          </p>
        </div>

        {/* Note Box */}
        <div className="bg-accent/5 border border-accent/20 p-5 mb-10 text-xs text-text-primary leading-relaxed relative overflow-hidden">
          <strong className="block font-syne uppercase tracking-wider text-accent mb-1 font-bold text-[10px]">
            Platform Note
          </strong>
          Leenout is currently in early access. Our security practices, RLS schemas, and editor sandbox isolation frameworks will evolve as the platform scales.
        </div>

        {/* Security Content Sections */}
        <div className="space-y-12 text-sm text-text-primary/90 leading-relaxed font-mono">
          <p>
            This Security Policy describes how Leenout (<strong>"we," "us,"</strong> or <strong>"our"</strong>) protects user data, manages platform security, and handles vulnerability disclosures for the Leenout website and web application (collectively, the <strong>"Services"</strong>).
          </p>

          <hr className="border-border/40" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 id="s1" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">01 //</span> Security Controls & Infrastructure
            </h2>
            <div className="bg-accent/5 border-l-2 border-accent p-4 text-xs text-text-muted mb-4">
              <strong className="text-accent font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              We deploy strict database-level security parameters, isolated iframe execution sandbox environments, and token gating.
            </div>
            <p>
              We take reasonable, practical steps to protect the platform and developer assets. Our core security configurations include:
            </p>
            <ul className="list-inside list-square pl-4 space-y-3 text-xs text-text-muted">
              <li>
                <strong>Third-Party Authentication:</strong> All user registration and sessions are governed by GitHub OAuth and magic-link flows powered by <strong>Supabase Auth</strong>. We do not store or process passwords.
              </li>
              <li>
                <strong>Short-Lived JWT Sessions:</strong> User logins generate encrypted JWT tokens which auto-refresh securely. Session hijacking is guarded at the network layer.
              </li>
              <li>
                <strong>Row Level Security (RLS):</strong> Every database entity in PostgreSQL is protected by strict RLS policies. A contributor cannot bypass RLS filters to query or update files they do not hold explicit owner-issued credentials for.
              </li>
              <li>
                <strong>Static Iframe Compiler Sandbox (Strict):</strong> The dynamic static preview compiler compiles code in a restricted container iframe built with <code>sandbox="allow-scripts"</code>. This locks sandboxed code from accessing parent window hooks, local storage, or document cookies.
              </li>
              <li>
                <strong>Service Role Isolation (Strict):</strong> The Supabase service role key (which bypasses RLS checks) is kept <strong>strictly inside the Express backend</strong> node environment. It is never exposed or shipped to the frontend Next.js bundles.
              </li>
              <li>
                <strong>Pre-Commit Secret & Vulnerability Scanner:</strong> Code saved in Monaco editor is automatically scanned client-side for hardcoded secrets (Stripe keys, AWS tokens, private keys) before committing to prevent credential leaks.
              </li>
              <li>
                <strong>Selective File Masking ("Zero-Trust"):</strong> Project owners can flag sensitive files as masked. Non-owner contributors can edit and preview frontend components while secret backend source files remain completely hidden.
              </li>
              <li>
                <strong>SSL Gating & API Rate Limiting:</strong> All network exchanges are encrypted end-to-end via secure HTTPS and WebSockets with Express rate limiting protecting endpoints.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 id="s2" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">02 //</span> Database & Data Retention
            </h2>
            <p>
              Leenout stores developer profile details, active workspace code, file histories, pitch requests, session snapshots, and cooldown records.
            </p>
            <p>
              We do not store payment profiles or highly sensitive government identifiers. We do not sell, trade, or rent user information. For comprehensive details on what data we collect, why we collect it, how you can perform a self-service account purge, and our strict COPPA/GDPR 13-year age limitation gating, please review our dedicated <a href="/legals/privacy" className="text-accent hover:underline">Privacy Policy</a>.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 id="s3" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">03 //</span> Infrastructure Partners
            </h2>
            <p>
              Leenout relies on specialized third-party cloud infrastructure providers:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>Supabase</strong> &bull; Postgres Database & JWT Auth</li>
              <li><strong>Vercel</strong> &bull; Secure Frontend Deployment Gating</li>
              <li><strong>Render</strong> &bull; Node Express API & Socket.io server container</li>
              <li><strong>Resend</strong> &bull; Transactional Email routing</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 id="s4" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">04 //</span> Developer Security Hygiene
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted mb-4">
              <strong className="text-accent2 font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Your account security is a collaborative task. Never commit hardcoded secret keys to public repositories.
            </div>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Never write raw API keys, Postgres connection strings, or cloud secrets inside project code files.</li>
              <li>Actively review allowed file parameters before assigning scheduled windows to guest programmers.</li>
              <li>Deploy kicks immediately if you notice suspicious keystrokes or unauthorized edit attempts.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 id="s5" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">05 //</span> Vulnerability Disclosures
            </h2>
            <div className="bg-accent/5 border-l-2 border-accent p-4 text-xs text-text-muted flex items-start gap-3 mb-4">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <strong className="text-accent font-bold uppercase tracking-wider text-[9px] block mb-1">Responsible Disclosure:</strong>
                If you locate a security exploit or RLS circular policy vulnerability, please email us privately before a public disclosure. This protects developer files.
              </div>
            </div>
            <p>
              Please submit details, reproduction steps, and payloads securely via our official <a href="/support" className="text-accent hover:underline">Support & Help Form</a>. We commit to:
            </p>
            <ul className="list-inside list-square pl-4 space-y-1 text-xs text-text-muted">
              <li>Acknowledge and assign an engineer to your report within 72 hours.</li>
              <li>Investigate and patch vulnerabilities immediately.</li>
              <li>Maintain a safe harbor model, refusing legal actions against researchers testing in good faith.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 id="s6" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">06 //</span> Incident Response
            </h2>
            <p>
              In the event of a database breach or server compromise, Leenout will notify affected developers via email, provide detailed logs of the affected files, and outline corrective actions within a reasonable timeframe.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 id="s7" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">07 //</span> Abuse, Rate-Limiting & DDoS Protections
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted mb-4">
              <strong className="text-accent2 font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              We enforce strict system limits to block denial-of-service abuse. Attempting to bypass limits is a policy violation.
            </div>
            <p>
              To maintain system stability and prevent denial-of-service (DDoS) events, Leenout enforces multi-tiered, sliding-window rate limiters. These limiters map requests by client IP address and user account claims:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>Global Limit:</strong> 100 requests per 15 minutes across all public asset controllers.</li>
              <li><strong>Strict Operations Limit:</strong> Capped at 5 requests per 1 minute on account deletion, repository forking, and socket connection requests.</li>
              <li><strong>Payload Restriction:</strong> Real-time editor file sync is capped at 2MB per payload to prevent remote node heap exhaustion.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 id="s8" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">08 //</span> Pen-Testing & Vulnerability Scanning Restrictions
            </h2>
            <p>
              While we encourage manual security investigations under our **Vulnerability Disclosures (Section 05)** guidelines, the deployment of automated, high-velocity penetration testing suites or vulnerability scanners (such as Nessus, Acunetix, or custom shell scripts) against our production URLs is strictly prohibited without prior written consent from Leenout Operations, as these generate unnecessary noise and logs exhaustion.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/40 mt-16 pt-8 text-center text-[10px] text-text-muted select-none">
          Leenout, Inc. &bull; Security Policy Standards &bull; May 2026
        </div>
      </div>
    </div>
  );
}
