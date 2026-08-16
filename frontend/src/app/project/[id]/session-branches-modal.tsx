"use client";

import React, { useState } from "react";
import { GitBranch, Check, X, Code2, Clock } from "lucide-react";

export interface SessionBranch {
  id: string;
  project_id: string;
  contributor_id: string;
  branch_name: string;
  status: "pending" | "merged" | "rejected";
  files_json: Array<{ filepath: string; content: string }>;
  created_at: string;
  contributor_name?: string;
}

interface SessionBranchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: SessionBranch[];
  onMergeBranch: (branch: SessionBranch) => Promise<void>;
  onRejectBranch: (branchId: string) => Promise<void>;
}

export default function SessionBranchesModal({
  isOpen,
  onClose,
  branches,
  onMergeBranch,
  onRejectBranch
}: SessionBranchesModalProps) {
  const [selectedBranch, setSelectedBranch] = useState<SessionBranch | null>(branches[0] || null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen) return null;

  const handleMerge = async (branch: SessionBranch) => {
    try {
      setActionLoading(true);
      await onMergeBranch(branch);
      onClose();
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (branchId: string) => {
    try {
      setActionLoading(true);
      await onRejectBranch(branchId);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/30 text-accent">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-primary text-base">Session Draft Branches</h3>
              <p className="text-xs text-text-dim">Review and merge contributor edit window submissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-text-primary text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border overflow-hidden">
          {/* Branch List */}
          <div className="p-4 overflow-y-auto space-y-2">
            <div className="text-[10px] uppercase font-bold text-text-dim tracking-wider mb-2">
              Pending Submissions ({branches.filter(b => b.status === "pending").length})
            </div>
            {branches.length === 0 ? (
              <div className="text-xs text-text-dim italic py-8 text-center">
                No draft branches submitted yet.
              </div>
            ) : (
              branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedBranch?.id === b.id
                      ? "bg-accent/10 border-accent text-accent"
                      : "bg-surface-hover/30 border-border text-text-primary hover:border-border-hover"
                  }`}
                >
                  <div className="font-mono text-xs font-semibold truncate flex items-center justify-between">
                    <span>{b.branch_name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      b.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      b.status === "merged" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-text-dim">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>• {b.files_json?.length || 0} file(s)</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Branch Details & Diff Preview */}
          <div className="md:col-span-2 p-6 flex flex-col justify-between overflow-y-auto bg-background/30">
            {selectedBranch ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-text-primary">{selectedBranch.branch_name}</h4>
                    <span className="text-xs text-text-dim">Submitted files preview</span>
                  </div>
                  {selectedBranch.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleReject(selectedBranch.id)}
                        className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleMerge(selectedBranch)}
                        className="px-4 py-1.5 rounded-lg bg-accent text-background font-bold text-xs hover:bg-accent/90 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-accent/20"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve & Merge
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {selectedBranch.files_json?.map((f, idx) => (
                    <div key={idx} className="border border-border rounded-lg overflow-hidden bg-surface">
                      <div className="px-3 py-2 bg-surface-hover border-b border-border flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-2 text-text-primary">
                          <Code2 className="w-4 h-4 text-accent" /> {f.filepath}
                        </span>
                        <span className="text-[10px] text-text-dim">{f.content.length} bytes</span>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-text-dim overflow-x-auto max-h-40 leading-relaxed bg-[#0a0a0a]">
                        {f.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-text-dim text-sm italic">
                Select a branch on the left to inspect file changes
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
