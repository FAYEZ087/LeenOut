"use client";

import React, { useState } from "react";
import { Radio, Users, Heart, ThumbsUp, Flame, Sparkles } from "lucide-react";

interface SpectatorBarProps {
  isOwner: boolean;
  isCasting: boolean;
  onToggleCast: (isCasting: boolean) => void;
  onSendReaction: (emoji: string) => void;
}

export default function SpectatorBar({
  isOwner,
  isCasting,
  onToggleCast,
  onSendReaction
}: SpectatorBarProps) {
  const [activeReactions, setActiveReactions] = useState<Array<{ id: string; emoji: string }>>([]);

  const triggerReaction = (emoji: string) => {
    onSendReaction(emoji);
    const id = Math.random().toString(36).substring(2, 9);
    setActiveReactions(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  return (
    <div className="bg-surface/90 border-b border-border px-4 py-2 flex items-center justify-between gap-4 select-none relative overflow-hidden">
      {/* Floating Reactions Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {activeReactions.map((r) => (
          <span
            key={r.id}
            className="animate-ping text-2xl absolute transition-all"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`
            }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      {/* Broadcast Status Indicator */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-bold ${
          isCasting ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-surface-hover border-border text-text-dim"
        }`}>
          <Radio className={`w-3.5 h-3.5 ${isCasting ? "animate-pulse text-red-500" : ""}`} />
          <span>{isCasting ? "STUDIO CAST LIVE" : "BROADCAST OFFLINE"}</span>
        </div>
        
        {isCasting && (
          <span className="text-[11px] text-text-dim flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-accent" /> Spectator Mode Active
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {isCasting && (
          <div className="flex items-center gap-1 border-r border-border pr-3 mr-1">
            {["🔥", "❤️", "👍", "🚀"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => triggerReaction(emoji)}
                className="px-2 py-1 hover:bg-surface-hover rounded text-sm transition-all hover:scale-125 cursor-pointer"
                title={`Send ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {isOwner && (
          <button
            onClick={() => onToggleCast(!isCasting)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isCasting
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-accent text-background hover:bg-accent/90 shadow-md shadow-accent/20"
            }`}
          >
            {isCasting ? "End Stream" : "Go Live (Studio Cast)"}
          </button>
        )}
      </div>
    </div>
  );
}
