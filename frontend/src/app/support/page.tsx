"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, ShieldCheck, HelpCircle, Send, CheckCircle2, MessageSquare, Lock, FileText, ChevronDown, ChevronUp, Zap, Radio
} from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do time-boxed contributor edit windows work?",
    answer: "Project owners set edit windows (e.g. 15 or 30 minutes) for approved contributors. During an active window, contributors have edit permissions to specified files. When the window expires, edit mode locks automatically and changes are saved into a draft session branch for owner review."
  },
  {
    question: "What is Selective File Masking and how does it protect my code?",
    answer: "Selective File Masking allows project owners to hide proprietary files (like API keys or server logic) from non-owners. Contributors can edit and preview frontend components while masked backend logic executes securely without exposing source code."
  },
  {
    question: "How does the Pre-Commit Secret Scanner protect my repository?",
    answer: "LeenOut's built-in secret scanner automatically inspects code prior to commits for hardcoded secrets (such as Stripe keys, AWS credentials, or private RSA keys) and blocks unsafe commits instantly."
  },
  {
    question: "What happens when I claim a Snippet Micro-Bounty?",
    answer: "When a contributor claims a micro-bounty, they are assigned to implement a specific file feature. Once the owner approves and merges the submitted code, the bounty status updates to completed."
  },
  {
    question: "How do I launch a Studio Cast spectator stream?",
    answer: "Project owners can click [Go Live (Studio Cast)] in the Studio header. Spectators can tune in to watch live code edits and send floating emoji reactions without consuming an active contributor slot."
  }
];

export default function SupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Ticket Form States
  const [category, setCategory] = useState("Technical Support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg px-6 py-12 relative font-mono text-text-primary selection:bg-accent selection:text-bg">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase font-bold bg-transparent border-none p-0 cursor-pointer select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Page Header */}
        <div className="border-b border-border pb-8 select-none">
          <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent/5 px-3.5 py-1 mb-4 text-[10px] uppercase tracking-wider text-accent font-semibold">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Trust & Support Portal</span>
          </div>
          <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-3">
            Developer Support <span className="text-accent">& Help Hub</span>
          </h1>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            Get help with real-time pairing sessions, security controls, RLS permissions, and platform features.
          </p>
          <p className="text-[11px] text-text-muted mt-2">
            Last updated: August 15, 2026 &bull; Platform Support Portal v2.0
          </p>
        </div>

        {/* System Health Status Banner */}
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-400 text-sm">All Systems Operational</h3>
              <p className="text-xs text-text-muted">Supabase Auth, WebSockets, RLS Guards, & Studio Engine running at 99.9% uptime</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Operational</span>
          </div>
        </div>

        {/* Main Content Grid: Ticket Form & Quick Legal Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left 2 Cols: Submit Support Ticket */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="font-bold text-base text-text-primary flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent" /> Submit Support Ticket
                </h2>
                <span className="text-[10px] uppercase font-bold text-text-muted">Direct Response within 24h</span>
              </div>

              {submitted ? (
                <div className="p-8 text-center bg-accent/5 border border-accent/20 rounded-xl space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-accent mx-auto" />
                  <h3 className="font-bold text-base text-text-primary">Ticket Received!</h3>
                  <p className="text-xs text-text-muted max-w-md mx-auto">
                    Your support ticket has been submitted to the LeenOut engineering team. We will review your inquiry and respond to your email.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-accent text-background font-bold text-xs rounded-lg hover:bg-accent/90 cursor-pointer"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Inquiry Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-surface border border-border px-3 py-2 text-text-primary focus:border-accent focus:outline-none rounded-lg"
                    >
                      <option value="Technical Support">Technical & Studio Support</option>
                      <option value="Security Vulnerability">Security & Vulnerability Disclosure</option>
                      <option value="Account & Access">Account & Edit Window Access</option>
                      <option value="API Inquiry">Developer API & Webhooks</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Developer Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface border border-border px-3 py-2 text-text-primary focus:border-accent focus:outline-none rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="dev@leenout.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface border border-border px-3 py-2 text-text-primary focus:border-accent focus:outline-none rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Ticket Description</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe your issue, reproduction steps, or question in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-surface border border-border p-3 text-text-primary focus:border-accent focus:outline-none rounded-lg resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-accent text-background font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Transmitting Ticket..." : "Submit Support Ticket"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Col: Trust & Security Resource Cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">Trust & Legal Resources</h3>
            
            <div className="space-y-2">
              {[
                { title: "Security Policy", href: "/legals/security", desc: "Encryption, RLS & Secret Scanner", icon: ShieldCheck },
                { title: "Privacy Policy", href: "/legals/privacy", desc: "Data Retention & Session Logs", icon: Lock },
                { title: "Terms of Service", href: "/legals/terms", desc: "Platform Rules & Bounties", icon: FileText },
                { title: "Platform Disclaimer", href: "/legals/disclaimer", desc: "Sandbox Code Execution", icon: Zap },
                { title: "Developer API Docs", href: "/legals/developer-api", desc: "WebSockets & REST Endpoints", icon: Radio }
              ].map((res) => {
                const IconComp = res.icon;
                return (
                  <Link
                    key={res.href}
                    href={res.href}
                    className="p-3.5 bg-surface border border-border hover:border-accent/50 rounded-xl block transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent group-hover:bg-accent group-hover:text-background transition-all">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-text-primary group-hover:text-accent transition-colors">{res.title}</h4>
                        <p className="text-[10px] text-text-muted">{res.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Developer FAQ Accordions */}
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="space-y-1">
            <h2 className="font-bold text-lg text-text-primary flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-accent" /> Developer FAQ
            </h2>
            <p className="text-xs text-text-muted">Answers to common questions regarding LeenOut platform features and controls</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-border rounded-xl bg-surface overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs text-text-primary flex items-center justify-between hover:bg-surface-hover/50 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-text-muted leading-relaxed border-t border-border/40 pt-3 bg-background/40 font-mono">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
