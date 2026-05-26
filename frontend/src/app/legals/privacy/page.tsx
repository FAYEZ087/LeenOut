"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Eye, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>User Data Privacy Standards</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Privacy <span className="text-accent">Policy</span>
          </h1>
          <p className="text-xs text-text-muted">
            Last updated: May 25, 2026 &bull; Data Protection Protocol v1.0
          </p>
        </div>

        {/* Note Box */}
        <div className="bg-accent/5 border border-accent/20 p-5 mb-10 text-xs text-text-primary leading-relaxed relative overflow-hidden">
          <strong className="block font-syne uppercase tracking-wider text-accent mb-1 font-bold text-[10px]">
            Platform Note
          </strong>
          Leenout is currently in early access. This Privacy Policy details our strict adherence to user-data isolation, COPPA/GDPR compliance, and transparent user tracking parameters.
        </div>

        {/* Privacy Policy Sections */}
        <div className="space-y-12 text-sm text-text-primary/90 leading-relaxed font-mono">
          <p>
            This Privacy Policy (<strong>"Policy"</strong>) explains how Leenout (<strong>"we," "us,"</strong> or <strong>"our"</strong>) collects, uses, shares, and secures the data generated when you access and collaborate within our coding workspaces.
          </p>

          <hr className="border-border/40" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 id="s1" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">01 //</span> Strict Age Limitations (COPPA / GDPR)
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              You must be at least 13 years old to use Leenout. We immediately wipe data of anyone under this age threshold.
            </div>
            <p>
              Leenout enforces a strict age limit to protect minors' online privacy. The platform is not directed towards, designed for, or permitted to be used by individuals under the age of <strong>13</strong>.
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>Verification:</strong> By authenticating via GitHub OAuth, you warrant that you satisfy our age threshold requirements.</li>
              <li><strong>Zero Tolerance Data Wipe:</strong> We do not knowingly collect personal details from children under 13. If we discover that a registered session belongs to a minor under 13, we will execute database cascade wipes to permanently destroy their user profile, workspace files, and active session history instantly.</li>
              <li><strong>EEA/UK Residents:</strong> For developers operating within the EEA or United Kingdom, the minimum permitted age is <strong>16</strong> unless local jurisdiction allows a lower age of consent.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 id="s2" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">02 //</span> Information We Collect
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              We collect your public GitHub profile info, workspace code modifications, chat logs, and diagnostic networking logs.
            </div>
            <p>
              Leenout collects two categories of developer information:
            </p>
            
            <h3 className="font-syne text-xs font-bold text-text-primary uppercase tracking-wider pl-2 mt-4 select-none">// A. Data You Provide Directly:</h3>
            <ul className="list-inside list-square pl-6 space-y-2 text-xs text-text-muted">
              <li><strong>Authentication Data:</strong> When logging in via GitHub OAuth, we collect your GitHub numeric ID, public username, registered email address, avatar URL, and public profile link.</li>
              <li><strong>Profile Metadata:</strong> Custom fields added to your Profile Card including your full name, bio, stack specializations, and portfolio tags.</li>
            </ul>

            <h3 className="font-syne text-xs font-bold text-text-primary uppercase tracking-wider pl-2 mt-4 select-none">// B. Activity & Code Workspace Data:</h3>
            <ul className="list-inside list-square pl-6 space-y-2 text-xs text-text-muted">
              <li><strong>Workspace Codes & Files:</strong> Code modifications, file directories tree structures, active Timed Edit window reservations, and project file content payloads synced over WebSockets.</li>
              <li><strong>Real-time Collaborations:</strong> Socket chat room messages and guest programmer access requests (pitches) sent to project owners.</li>
              <li><strong>Technical Logs:</strong> Diagnostic variables including client IP address (used strictly for rate limiting security protection), browser user agent headers, page views, and API response performance logs.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 id="s3" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">03 //</span> How We Use Your Data
            </h2>
            <p>
              We process user data strictly to operate and secure our real-time collaboration environment. We use data to:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Render your public Developer Profile Card to help stranger project owners evaluate your pitches.</li>
              <li>Synchronize real-time keystrokes and file edits dynamically across collaborative sessions.</li>
              <li>Enforce our strict 7-day kicked contributor request cooldowns and timelock edit windows.</li>
              <li>Detect and prevent security exploits, RLS bypass attempts, and malicious denial-of-service abuse.</li>
            </ul>
            <p>
              We do not sell, trade, or rent user database records to third-party ad networks or data brokers.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 id="s4" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">04 //</span> Data Retention & Self-Service Deletion
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Delete your account under Profile settings at any time to permanently wipe your database records instantly.
            </div>
            <p>
              We believe in full developer data sovereignty. You retain permanent ownership of your personal data:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li><strong>Account Deletion:</strong> You can permanently wipe your account at any time under your **Profile Settings**.</li>
              <li><strong>Database Purge:</strong> Clicking delete triggers a secure cascade transaction in PostgreSQL that permanently deletes your profile details, active workspace codebases, file history arrays, and chat logs within seconds.</li>
              <li><strong>Log Retention:</strong> Anonymized server-side access logs (which strip user identifiers) may be kept up to 30 days strictly for operational analytics and security audits.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 id="s5" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">05 //</span> Subprocessors & Third Parties
            </h2>
            <p>
              To maintain our infrastructure stack, we share isolated data scopes with trusted subprocessors detailed in our **Security Policy (Section 03)** (including Supabase, Render, Vercel, and Resend). All sharing is strictly limited to transactional email routing, secure auth checking, and database storage operations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 id="s6" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">06 //</span> Contact Us & Support
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data sovereignty, please reach out to us by filling out our dedicated <a href="/support" className="text-accent hover:underline">Support & Help Form</a>. We commit to responding to all legitimate inquiries within 48 hours.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/40 mt-16 pt-8 text-center text-[10px] text-text-muted select-none">
          Leenout, Inc. &bull; Data Protection Privacy Policy &bull; May 2026
        </div>
      </div>
    </div>
  );
}
