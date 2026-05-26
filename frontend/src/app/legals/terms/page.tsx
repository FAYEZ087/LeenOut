"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Scale, FileText } from "lucide-react";

export default function TermsOfServicePage() {
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
            <Scale className="h-3.5 w-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Terms of <span className="text-accent">Service</span>
          </h1>
          <p className="text-xs text-text-muted">
            Last updated: May 25, 2026 &bull; Early Access Protocol v1.0
          </p>
        </div>

        {/* Note Box */}
        <div className="bg-accent/5 border border-accent/20 p-5 mb-10 text-xs text-text-primary leading-relaxed relative overflow-hidden">
          <strong className="block font-syne uppercase tracking-wider text-accent mb-1 font-bold text-[10px]">
            Platform Note
          </strong>
          Leenout is currently in early access. These Terms of Service will be updated dynamically as the collaborative coder marketplace evolves.
        </div>

        {/* Terms Content Sections */}
        <div className="space-y-12 text-sm text-text-primary/90 leading-relaxed font-mono">
          <p>
            These Terms of Service (<strong>"Terms"</strong>) govern your access to and use of the Leenout website and web application (collectively, the <strong>"Services"</strong>) operated by Leenout (<strong>"we," "us,"</strong> or <strong>"our"</strong>).
          </p>

          <p>
            By accessing or using our Services, you confirm that you are at least 13 years of age, have read and understood these Terms, and agree to be bound by them. If you do not agree to these rules, do not use the Services.
          </p>

          <hr className="border-border/40" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 id="s1" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">01 //</span> Accounts & Registration
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              You are responsible for your account credentials, authorization keys, and everything that happens under your session.
            </div>
            <p>
              To use Leenout, you must create an account by authenticating via GitHub OAuth or a magic link sent to your email address. By registering, you agree to:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Provide accurate and truthful information during registration profiles creation.</li>
              <li>Keep your authentication credentials secure and not share session keys with others.</li>
              <li>Notify us immediately if you suspect unauthorized access to your workspace credentials.</li>
              <li>Accept full responsibility for all activity that occurs under your account.</li>
            </ul>
            <p>
              We reserve the right to suspend or permanently delete accounts that violate these Terms or that we determine, in our sole discretion, pose a security risk to the collaborative platform.
            </p>
            <h3 className="font-syne text-xs font-bold text-text-primary uppercase tracking-wider pl-2 mt-4 select-none">// Age Restriction & Parental Gating:</h3>
            <p className="text-xs text-text-muted font-light">
              Leenout enforces a strict age limit to comply with children's online privacy protocols (COPPA/GDPR). You must be at least <strong>13</strong> years of age (or <strong>16</strong> if residing within the EEA or United Kingdom) to register. If we learn that database records belong to an individual under the age threshold, we will execute instant, permanent cascade wipes to erase all profile variables, active files, and recorded keystrokes from transient and persistent database memory. Refer to our dedicated <a href="/legals/privacy" className="text-accent hover:underline">Privacy Policy</a> for full data protection details.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 id="s2" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">02 //</span> Acceptable Use Policy
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Use Leenout to build codebases and collaborate with strangers, not to exploit systems or harm visitors.
            </div>
            <p>
              You agree to use the Services only for lawful coding purposes and in a manner consistent with these Terms. You must not:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Upload, save, or execute malicious code, malware, API-sniffing scripts, or anything intended to damage servers.</li>
              <li>Use the project real-time studio chat to harass, threaten, or abuse other collaborators.</li>
              <li>Attempt to gain unauthorized write access to files or directories outside your allowed paths.</li>
              <li>Circumvent active timed edit window restrictions or database security permission gates.</li>
              <li>Submit intellectual property that infringes on third-party licenses or copyrights.</li>
              <li>Deploy automated bots, crawlers, or terminal script loops to spam access requests or pitches.</li>
            </ul>
            <p>
              Violation of these acceptable use parameters will result in immediate kick, cooldown logs entries, and account terminations without appeal.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 id="s3" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">03 //</span> Projects, Ownership and Collaboration
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Project owners hold absolute sovereign control over their workspaces. Contributors agree to the owner's permission tree.
            </div>
            <p>
              Leenout facilitates active coding workspaces for strangers. The following terms govern collaborations:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Project owners retain full administrative control, including the right to approve or deny requests, set allowed files restrictions, schedule slot edit windows, and kick contributors instantly.</li>
              <li>Contributors agree to operate strictly within the timed intervals and file scopes set by the project owner.</li>
              <li>Leenout does not mediate disputes between project members. Owner decisions regarding sandbox access are final.</li>
              <li>Kicked contributors are locked by a database-enforced 7-day request cooldown check.</li>
              <li>Public workspaces can be discovered, watched, and forked by any authenticated user. Do not publish private codes.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 id="s4" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">04 //</span> Intellectual Property
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              You own the code you commit. Leenout claims zero rights over your projects. We own the underlying platform structure.
            </div>
            <p>
              All files, commits, and assets submitted to Leenout by users remain the intellectual property of the submitting developer or their rights holders.
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>By submitting code to a public project, you grant other developers the right to read, watch, and fork that content.</li>
              <li><strong>Contributor License Default:</strong> By pitching and submitting code contributions to another user's project, you grant the project owner a non-exclusive, perpetual, royalty-free, worldwide license to use, modify, distribute, and compile your submitted code within that project.</li>
              <li>Leenout's platform layout, aesthetic Dark tokens, design, and compiled bundlers are the exclusive IP of Leenout.</li>
              <li>Users are solely responsible for licensing their own codebases appropriately.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 id="s5" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">05 //</span> Project Forking Model
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Forking creates a standalone, independent copy of a codebase under your ownership. Original parent records are preserved.
            </div>
            <p>
              Clicking **Fork** clones the parent projects files and metadata into a new record assigned to you. By doing so:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>You assume full ownership and administrative control over the cloned project copy.</li>
              <li>Forked repositories are public by default to ensure educational platform openness.</li>
              <li>If the parent project is deleted, forks survive independently, displaying a `"Forked from a deleted project"` provenance.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 id="s6" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">06 //</span> Termination rights
            </h2>
            <p>
              You can request account deletion at any time in your Profile Settings panel, which executes database wiping routines. We reserve the right to suspend accounts immediately for unacceptable activity or RLS bypass attempts.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 id="s7" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">07 //</span> Limitation of Liability
            </h2>
            <p className="uppercase tracking-wide text-xs text-text-primary/75 bg-surface p-4 border border-border">
              To the maximum extent permitted by law, Leenout shall not be liable for any indirect, incidental, or special damages, including but not limited to loss of code, data corruption, or service interruptions. Our total liability is capped at INR 100 or the amount paid to us in the last 12 months.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 id="s8" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">08 //</span> Jurisdiction & Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising under these terms are subject to the exclusive jurisdiction of the courts located in <strong>Bhubaneswar, Odisha, India</strong>.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 id="s9" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">09 //</span> Platform Pricing & Early Access Policies
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              The platform is free in early access, but we may introduce subscription tiers or storage limits later.
            </div>
            <p>
              Leenout is currently provided in an early access phase. Access is free of charge; however, we reserve the right to modify pricing structures, introduce subscription tiers, place limits on storage space, or restrict real-time compute/socket sessions at any time with reasonable notice.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 id="s10" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">10 //</span> Automated Scraping & Extraction Limits
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Do not scrap public developer profiles or projects for dataset training or automated lists.
            </div>
            <p>
              You must not deploy bots, automated scrapers, web spiders, or data mining software to harvest public developer details, profile cards, project scopes, or active code bases from Leenout, including for the purpose of training machine learning or AI models, without our prior written authorization.
            </p>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 id="s11" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">11 //</span> Questions & Support
            </h2>
            <p>
              If you have any questions about these Terms of Service or need developer support, please reach out to us by filing a ticket through our official <a href="/support" className="text-accent hover:underline">Support & Help Form</a>.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/40 mt-16 pt-8 text-center text-[10px] text-text-muted select-none">
          Leenout, Inc. &bull; Terms of Service Agreement &bull; May 2026
        </div>
      </div>
    </div>
  );
}
