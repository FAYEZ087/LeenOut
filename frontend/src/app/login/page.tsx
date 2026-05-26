"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { Github, Mail, Sparkles, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: "error", text: "We couldn't connect to GitHub authentication. Please try again later." });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setMessage({ type: "error", text: "We couldn't connect to Google authentication. Please try again later." });
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setMessage(null);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
        },
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Check your inbox! We sent a secure magic sign-in link.",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: "We encountered a problem sending your secure sign-in link. Please verify your email and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-24 bg-bg relative">
      <div className="w-full max-w-md p-8 glass-panel border border-border relative z-10 shadow-2xl">
        {/* Top visual neon accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent2" />

        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-surface border border-border text-accent mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="font-syne text-3xl font-extrabold tracking-tight mb-2">
            Walk into the <span className="text-accent">Workspace</span>
          </h2>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Sign in to discover projects, request access, and start coding alongside strangers.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 border mb-6 text-xs ${
              message.type === "success"
                ? "bg-note-bg border-note-border text-accent"
                : "bg-warning-bg border-warning-border text-accent2"
            }`}
          >
            <p className="font-semibold uppercase tracking-wider mb-1">
              {message.type === "success" ? "System Alert" : "Authentication Alert"}
            </p>
            <p>{message.text}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* GitHub Auth - Primary */}
          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface2 text-text-primary border border-border hover:border-accent font-semibold text-xs uppercase tracking-wider py-4 px-6 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <Github className="h-4 w-4" />}
            Continue with GitHub
          </button>

          {/* Google Auth - Secondary */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-surface hover:bg-surface2 text-text-primary border border-border hover:border-accent font-semibold text-xs uppercase tracking-wider py-4 px-6 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-[10px] text-text-muted uppercase tracking-widest font-medium">
              or use secret link
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Magic Link Auth - Fallback */}
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold">
                Developer Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-surface border border-border text-text-primary px-4 py-3 pl-11 text-xs focus:border-accent focus:outline-none transition-all disabled:opacity-50"
                />
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 bg-text-primary hover:bg-accent text-bg hover:text-bg font-semibold text-xs uppercase tracking-widest py-3.5 px-6 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Request Sign-In Link"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
