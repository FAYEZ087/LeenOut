"use client";

import React from "react";
import { DiffEditor } from "@monaco-editor/react";
import { X, Check } from "lucide-react";

interface MonacoDiffProps {
  original: string; // current code in files state
  modified: string; // historic snapshot content to revert to
  filepath: string;
  onClose: () => void;
  onConfirmRevert: () => void;
  username: string;
  timestamp: string;
}

export default function MonacoDiff({
  original,
  modified,
  filepath,
  onClose,
  onConfirmRevert,
  username,
  timestamp
}: MonacoDiffProps) {
  
  const getLanguage = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
      case "htm":
        return "html";
      case "css":
        return "css";
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "json":
        return "json";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="fixed inset-0 bg-bg/95 backdrop-blur-md flex flex-col z-[60] animate-fade-in font-mono select-none">
      
      {/* Visual top control bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#0d0d0d] shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-widest font-bold">Diff Viewer</span>
            <span className="text-xs bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 font-bold">{filepath}</span>
          </div>
          <p className="text-[10px] text-text-dim m-0">
            Comparing <span className="text-text-primary">Current Workspace version (Left)</span> to <span className="text-accent2">Snapshot by {username} at {new Date(timestamp).toLocaleString()} (Right)</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onConfirmRevert}
            className="bg-accent hover:bg-accent2 text-bg hover:text-text-primary px-4 py-2 text-xs uppercase font-extrabold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer rounded-none"
          >
            <Check className="h-4 w-4" /> Revert to This Snapshot
          </button>
          
          <button
            onClick={onClose}
            className="border border-border hover:border-text-primary text-text-muted hover:text-text-primary px-4 py-2 text-xs uppercase tracking-wider transition-colors cursor-pointer rounded-none flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </div>

      {/* Monaco Diff Workspace */}
      <div className="flex-1 relative bg-[#111111] overflow-hidden">
        <DiffEditor
          height="100%"
          language={getLanguage(filepath)}
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            minimap: { enabled: false },
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            lineNumbersMinChars: 3,
            folding: true,
            automaticLayout: true,
            wordWrap: "on",
            renderSideBySide: true
          }}
          theme="vs-dark"
        />
      </div>

    </div>
  );
}
