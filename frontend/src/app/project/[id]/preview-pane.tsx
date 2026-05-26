"use client";

import React, { useMemo } from "react";
import { Play, ShieldAlert, Monitor, Terminal } from "lucide-react";
import { ProjectFile } from "./file-tree";

interface PreviewPaneProps {
  files: ProjectFile[];
}

export default function PreviewPane({ files }: PreviewPaneProps) {
  
  // Custom client-side inlining bundler compiler
  const compiledSrcDoc = useMemo(() => {
    const htmlFile = files.find(f => f.filepath === "index.html" || f.filename === "index.html");
    if (!htmlFile) return null;

    if (!htmlFile.content || !htmlFile.content.trim()) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      background-color: #0c0c0c;
      color: #f0f0f0;
      font-family: 'DM Mono', monospace, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #111111;
      border: 1px dashed #e8ff47;
      padding: 32px;
      max-width: 380px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      position: relative;
    }
    .card::before {
      content: '';
      position: absolute;
      top: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #e8ff47;
    }
    h3 {
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #e8ff47;
      margin-top: 0;
      margin-bottom: 12px;
    }
    p {
      color: #888888;
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    kbd {
      background: #1a1a1a;
      border: 1px solid #222222;
      color: #e8ff47;
      padding: 2px 6px;
      font-size: 10px;
      border-radius: 2px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h3>index.html is empty</h3>
    <p>Type some HTML markup (like <code>&lt;h1&gt;Welcome to Leenout&lt;/h1&gt;</code>) in Monaco, then press <kbd>Ctrl + S</kbd> to save and render your project!</p>
  </div>
</body>
</html>`;
    }

    let htmlContent = htmlFile.content;

    // 1. Compile relative stylesheet links with inlined CSS content
    const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
    htmlContent = htmlContent.replace(linkRegex, (match, href) => {
      const cleanHref = href.replace(/^\.\//, ""); // strip leading "./"
      const cssFile = files.find(f => f.filepath === cleanHref || f.filename === cleanHref);
      if (cssFile) {
        return `<style data-inlined="${cleanHref}">\n${cssFile.content}\n</style>`;
      }
      return match;
    });

    // 2. Compile relative javascript scripts with inlined JS code
    const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>\s*<\/script>/gi;
    htmlContent = htmlContent.replace(scriptRegex, (match, src) => {
      const cleanSrc = src.replace(/^\.\//, ""); // strip leading "./"
      const jsFile = files.find(f => f.filepath === cleanSrc || f.filename === cleanSrc);
      if (jsFile) {
        return `<script data-inlined="${cleanSrc}">\n${jsFile.content}\n</script>`;
      }
      return match;
    });

    return htmlContent;
  }, [files]);

  return (
    <div className="h-full flex flex-col bg-bg font-mono border-t lg:border-t-0 lg:border-l border-border select-none">
      
      {/* Visual control bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#0d0d0d]">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-primary uppercase tracking-wider font-syne">
          <Monitor className="h-4 w-4 text-accent" />
          <span>Live Studio Rendering</span>
        </div>

      </div>

      {/* Main rendering area */}
      <div className="flex-1 relative bg-[#111111] overflow-hidden">
        {compiledSrcDoc ? (
          <iframe
            srcDoc={compiledSrcDoc}
            title="Leenout Sandbox Preview"
            sandbox="allow-scripts"
            className="absolute inset-0 w-full h-full border-none bg-[#111111]"
            style={{ colorScheme: "normal" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0c0c0c] flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-3.5 bg-warning-bg border border-warning-border text-accent2">
              <ShieldAlert className="h-8 w-8" />
            </div>
            
            <div>
              <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-text-primary mb-1">
                index.html Missing
              </h3>
              <p className="text-[11px] text-text-muted max-w-xs leading-relaxed mx-auto">
                No entrypoint found. Create or select <code className="text-accent bg-surface px-1.5 py-0.5 font-mono text-[10px]">index.html</code> in the file sidebar to render your live visual workspace preview.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
