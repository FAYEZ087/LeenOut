"use client";

import React, { useState } from "react";
import { DollarSign, Plus, CheckCircle2, Award, FileCode } from "lucide-react";

export interface Bounty {
  id: string;
  project_id: string;
  filepath: string;
  title: string;
  reward_amount: string;
  status: "open" | "claimed" | "merged";
  created_at: string;
}

interface BountiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bounties: Bounty[];
  isOwner: boolean;
  onCreateBounty: (title: string, filepath: string, reward: string) => Promise<void>;
  onClaimBounty: (bountyId: string) => Promise<void>;
}

export default function BountiesModal({
  isOpen,
  onClose,
  bounties,
  isOwner,
  onCreateBounty,
  onClaimBounty
}: BountiesModalProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState("");
  const [filepath, setFilepath] = useState("index.html");
  const [reward, setReward] = useState("$25");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setSubmitting(true);
      await onCreateBounty(title, filepath, reward);
      setTitle("");
      setShowCreateForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base">Snippet Micro-Bounties</h3>
              <p className="text-xs text-text-dim">Post and claim tasks with instant rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-primary text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isOwner && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateForm(prev => !prev)}
                className="px-3 py-1.5 rounded-lg bg-accent text-background font-bold text-xs hover:bg-accent/90 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {showCreateForm ? "Cancel" : "New Bounty"}
              </button>
            </div>
          )}

          {showCreateForm && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-accent/30 bg-accent/5 space-y-3">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Create Micro-Bounty Task</h4>
              <div>
                <label className="text-[10px] font-bold uppercase text-text-dim">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement responsive dark mode navbar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-dim">Target Filepath</label>
                  <input
                    type="text"
                    required
                    value={filepath}
                    onChange={(e) => setFilepath(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-dim">Reward</label>
                  <input
                    type="text"
                    required
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-surface border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-accent text-background font-bold text-xs rounded-lg hover:bg-accent/90 cursor-pointer"
              >
                {submitting ? "Posting..." : "Publish Bounty"}
              </button>
            </form>
          )}

          {/* List of Bounties */}
          <div className="space-y-2">
            {bounties.length === 0 ? (
              <div className="text-center py-12 text-xs text-text-dim italic">
                No active micro-bounties for this workspace.
              </div>
            ) : (
              bounties.map(b => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-border bg-surface hover:border-border-hover transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-text-primary">{b.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        b.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-text-dim/20 text-text-dim"
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-text-dim font-mono">
                      <span className="flex items-center gap-1"><FileCode className="w-3 h-3 text-accent" /> {b.filepath}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-sm flex items-center gap-1">
                      <Award className="w-4 h-4" /> {b.reward_amount}
                    </div>

                    {!isOwner && b.status === "open" && (
                      <button
                        onClick={() => onClaimBounty(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-accent text-background font-bold text-xs hover:bg-accent/90 cursor-pointer"
                      >
                        Claim Task
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
