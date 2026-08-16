"use client";

import React from "react";
import { Activity, Flame } from "lucide-react";

interface ContributionHeatmapProps {
  totalHours?: number;
  completedSessions?: number;
}

export default function ContributionHeatmap({
  totalHours = 48,
  completedSessions = 34
}: ContributionHeatmapProps) {
  // Generate 52 weeks x 7 days mock contribution grid (364 days)
  const days = Array.from({ length: 140 }).map((_, i) => {
    const intensity = (i % 7 === 0 || i % 11 === 0 || i % 13 === 0) ? Math.floor((i % 4) + 1) : 0;
    return { day: i, intensity };
  });

  const getIntensityColor = (level: number) => {
    switch (level) {
      case 1: return "bg-emerald-500/30 border-emerald-500/40";
      case 2: return "bg-emerald-500/60 border-emerald-500/70";
      case 3: return "bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/50";
      default: return "bg-surface-hover/40 border-border/40";
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="font-extrabold text-base text-text-primary">Collaboration Heatmap</h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-text-dim flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-accent" /> {totalHours} Live Hours
          </span>
          <span className="text-emerald-400 font-bold">{completedSessions} Sessions Completed</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[600px]">
          {days.map((d) => (
            <div
              key={d.day}
              className={`w-3.5 h-3.5 rounded-sm border transition-all hover:scale-125 cursor-pointer ${getIntensityColor(d.intensity)}`}
              title={`Day ${d.day + 1}: ${d.intensity > 0 ? `${d.intensity * 2} sessions` : "No contributions"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-text-dim">
        <span>Less active</span>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-surface-hover/40 border border-border/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 border border-emerald-500/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/60 border border-emerald-500/70" />
          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-300" />
        </div>
        <span>More active</span>
      </div>
    </div>
  );
}
