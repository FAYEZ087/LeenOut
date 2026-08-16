"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy, Clock, Zap, ArrowLeft, Play, Award, CheckCircle2 } from "lucide-react";
import AuthNav from "@/components/auth-nav";

interface Challenge {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  project_id: string;
  participants: number;
}

const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "ch-1",
    title: "React State Management Speed-Run",
    description: "Refactor un-optimized prop drilling into a lightweight Zustand store under 20 minutes.",
    time_limit_minutes: 20,
    project_id: "demo-react-1",
    participants: 42
  },
  {
    id: "ch-2",
    title: "Express Rate Limiting & Auth Hardening",
    description: "Patch 3 critical security vulnerabilities in Express middleware before the timer runs out.",
    time_limit_minutes: 15,
    project_id: "demo-express-1",
    participants: 28
  },
  {
    id: "ch-3",
    title: "Tailwind CSS Responsive Dashboard Sprint",
    description: "Convert a desktop dashboard mock into a pixel-perfect mobile responsive layout.",
    time_limit_minutes: 25,
    project_id: "demo-tailwind-1",
    participants: 65
  }
];

export default function ChallengesPage() {
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans">
      {/* Top Header Navigation */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-lg bg-surface border border-border hover:border-border-hover text-text-dim hover:text-text-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="font-extrabold text-lg text-text-primary tracking-tight">Speed-Run Challenges</h1>
          </div>
        </div>
        <AuthNav />
      </header>

      {/* Hero Banner */}
      <section className="px-6 py-10 bg-gradient-to-b from-amber-500/10 via-background to-background border-b border-border/50">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" /> Competitive Coding Arena
          </div>
          <h2 className="text-3xl font-black tracking-tight text-text-primary">
            Test Your Coding Speed Under Pressure
          </h2>
          <p className="text-text-dim text-sm max-w-2xl leading-relaxed">
            Pick a challenge, launch an isolated LeenOut workspace with a live countdown, and climb the public leaderboard by completing test suites in record time.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_CHALLENGES.map((ch) => (
            <div
              key={ch.id}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-text-dim">
                  <span className="flex items-center gap-1 font-bold text-amber-400"><Clock className="w-3.5 h-3.5" /> {ch.time_limit_minutes} MIN LIMIT</span>
                  <span>{ch.participants} Coders</span>
                </div>
                <h3 className="font-bold text-base text-text-primary group-hover:text-amber-400 transition-colors">
                  {ch.title}
                </h3>
                <p className="text-xs text-text-dim leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <Link
                  href={`/project/${ch.project_id}`}
                  className="w-full py-2 bg-amber-500 text-background font-black text-xs rounded-lg hover:bg-amber-400 flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Challenge
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Public Leaderboard Table */}
        <section className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-text-primary flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Speed-Run Global Leaderboard
            </h3>
            <span className="text-xs text-text-dim">Top 5 Performers</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-text-dim">
              <thead className="bg-surface-hover/50 text-[10px] uppercase font-bold text-text-dim border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Developer</th>
                  <th className="py-2.5 px-3">Challenge</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { rank: "🥇 #1", dev: "alex_coder", challenge: "React State Management", time: "11m 42s", score: "980 pts" },
                  { rank: "🥈 #2", dev: "dev_ninja", challenge: "Express Auth Hardening", time: "09m 15s", score: "950 pts" },
                  { rank: "🥉 #3", dev: "sarah_ts", challenge: "Tailwind Sprint", time: "14m 02s", score: "910 pts" },
                  { rank: "#4", dev: "fayez_dev", challenge: "React State Management", time: "15m 30s", score: "880 pts" },
                  { rank: "#5", dev: "sam_hacker", challenge: "Express Auth Hardening", time: "12m 10s", score: "860 pts" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-amber-400">{row.rank}</td>
                    <td className="py-3 px-3 font-bold text-text-primary">{row.dev}</td>
                    <td className="py-3 px-3">{row.challenge}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400 font-bold">{row.time}</td>
                    <td className="py-3 px-3 font-bold text-text-primary">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
