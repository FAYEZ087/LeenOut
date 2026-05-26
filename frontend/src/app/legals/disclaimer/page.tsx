"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Scale } from "lucide-react";

export default function DisclaimerPage() {
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
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Liability Limitations</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Platform <span className="text-accent">Disclaimer</span>
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
          Leenout is currently in early access. This Disclaimer will be updated dynamically as the collaborative coder marketplace scales.
        </div>

        {/* Disclaimer Content Sections */}
        <div className="space-y-12 text-sm text-text-primary/90 leading-relaxed font-mono">
          <p>
            This Disclaimer applies to the Leenout website and web application (collectively, the <strong>"Services"</strong>) operated by Leenout (<strong>"we," "us,"</strong> or <strong>"our"</strong>).
          </p>

          <p>
            Please read this Disclaimer carefully before using our Services. By accessing or using our Services, you confirm that you have read, understood, and agree to be bound by this Disclaimer.
          </p>

          <hr className="border-border/40" />

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 id="s1" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">01 //</span> General Platform Disclaimer
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Leenout is a collaborative coding platform provided as-is. We make no guarantees about outcomes of any collaboration.
            </div>
            <p>
              Leenout provides a web-based environment for developers to discover projects, request access, and collaborate on code with project owners and other contributors. All information, tools, and features are provided in good faith for general use; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, reliability, availability, or completeness of any information or feature on our Services.
            </p>
            <p className="uppercase tracking-wide text-xs text-accent2/90 bg-accent2/5 border border-accent2/25 p-4">
              UNDER NO CIRCUMSTANCE SHALL WE HAVE ANY LIABILITY TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF OUR SERVICES. YOUR USE OF OUR SERVICES IS SOLELY AT YOUR OWN RISK.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 id="s2" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">02 //</span> User-Generated Content Disclaimer
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              Leenout does not own, verify, or take responsibility for code or content submitted by users.
            </div>
            <p>
              All project code, descriptions, files, and communications on Leenout are created and submitted by independent users. Leenout does not review, verify, endorse, or take responsibility for any user-generated content on the platform.
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Leenout is not responsible for any code, output, or intellectual property submitted by project owners or contributors.</li>
              <li>Users are solely responsible for ensuring their submitted content does not infringe on third-party intellectual property rights.</li>
              <li>Leenout does not guarantee that any project, codebase, or collaboration will be functional, secure, or fit for any particular purpose.</li>
              <li>Any disputes between project owners and contributors are the sole responsibility of the parties involved.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 id="s3" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">03 //</span> No Guarantee of Availability
            </h2>
            <p>
              While Leenout strives to maintain continuous availability of its Services, we do not guarantee:
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>That the Services will be uninterrupted, error-free, or available at all times.</li>
              <li>That data stored on the platform will never be lost, corrupted, or inaccessible.</li>
              <li>That edit windows, real-time chat, or preview features will function without interruption.</li>
            </ul>
            <p>
              Leenout shall not be liable for any harm, loss, or damage resulting from unavailability or interruption of Services.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 id="s4" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">04 //</span> Intellectual Property Disclaimer
            </h2>
            <p>
              Leenout does not claim ownership over any code, files, or creative works submitted to the platform by users. Project owners retain full intellectual property rights over their projects, subject to any agreements made with contributors outside of the platform.
            </p>
            <ul className="list-inside list-square pl-4 space-y-2 text-xs text-text-muted">
              <li>Leenout is not responsible for resolving intellectual property disputes between collaborators.</li>
              <li>Users should establish their own agreements regarding code ownership before inviting contributors to their projects.</li>
              <li>Public projects on Leenout may be viewed and forked by other users; owners should not publish code they do not have the right to share.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 id="s5" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">05 //</span> Third-Party Tools Disclaimer
            </h2>
            <p>
              Leenout integrates third-party services including but not limited to Supabase (database and authentication) and other infrastructure providers. We are not responsible for the availability, security, or data practices of these third-party services. We encourage users to review the terms and privacy policies of all third-party services used by the platform.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 id="s6" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">06 //</span> Errors and Omissions
            </h2>
            <p>
              While we make every effort to ensure that information on our Services is accurate and up to date, we do not warrant that content is free from errors, omissions, or inaccuracies. We reserve the right to correct any errors and update information at any time without prior notice.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 id="s7" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">07 //</span> Sandbox & Local Browser Execution Disclaimer
            </h2>
            <div className="bg-accent2/5 border-l-2 border-accent2 p-4 text-xs text-text-muted italic mb-4">
              <strong className="text-accent2 not-italic font-bold uppercase tracking-wider text-[9px] block mb-1">In Short:</strong>
              You run workspace code in your browser at your own risk. We are not liable for client session data leakage or local crashes.
            </div>
            <p>
              Leenout compiles and executes collaborated code snippets inside client-side browser iframes using restricted sandbox parameters (`allow-scripts`). We do not run guest code on our server compute containers.
            </p>
            <p className="uppercase tracking-wide text-xs text-text-primary/75 bg-surface p-4 border border-border">
              WE ARE NOT LIABLE FOR ANY BROWSER CRASHES, HARDWARE OVERHEATING, MEMORY EXHAUSTION, LOCAL COOKIES LEAKAGE, OR DATA EXPLOITATION INITIATED BY RUNNING GUEST OR STRANGER PROGRAMMER SCRIPTS INSIDE YOUR LOCAL BROWSER WORKSPACE OR PREVIEW ENVIRONMENT.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 id="s8" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">08 //</span> Roster Badge & Informational Accuracy
            </h2>
            <p>
              Developer rankings, platform activity statistics, stack experience badges, and approval history logs displayed across public profile cards are automatically generated calculations based on recorded activity metadata. These badges are provided strictly for general informational purposes and do not represent a background check, vetting, endorsement, or representation of skill, reliability, or safety by Leenout.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 id="s9" className="font-syne text-lg font-bold text-accent uppercase tracking-wider flex items-center gap-2 select-none">
              <span className="text-xs text-text-muted">09 //</span> Contact & Support
            </h2>
            <p>
              If you require any clarification regarding this Platform Disclaimer or need operational assistance, please contact us directly via our <a href="/support" className="text-accent hover:underline">Support & Help Form</a>.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="border-t border-border/40 mt-16 pt-8 text-center text-[10px] text-text-muted select-none">
          Leenout, Inc. &bull; Liability Limitation Disclaimer &bull; May 2026
        </div>
      </div>
    </div>
  );
}
