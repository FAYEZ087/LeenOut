"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Play, ShieldAlert, Monitor, Terminal } from "lucide-react";
import { ProjectFile } from "./file-tree";

interface PreviewPaneProps {
  files: ProjectFile[];
}

export default function PreviewPane({ files }: PreviewPaneProps) {
  
  // DevTools Console State
  const [logs, setLogs] = useState<Array<{
    type: 'log' | 'error' | 'warn' | 'info';
    message: string;
    timestamp: string;
  }>>([]);
  const [consoleExpanded, setConsoleExpanded] = useState(false);

  // Hook message listener to capture logs postMessage relayed from the iframe sandbox
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'leenout-sandbox') {
        setLogs(prev => [...prev, {
          type: event.data.type,
          message: event.data.message,
          timestamp: event.data.timestamp
        }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Auto-scroll console terminal logs viewport to bottom on new logs
  useEffect(() => {
    if (consoleExpanded) {
      const anchor = document.getElementById("console-bottom-anchor");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, consoleExpanded]);

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

    const consoleInterceptorScript = `
      <script>
        (function() {
          const _log = console.log;
          const _error = console.error;
          const _warn = console.warn;
          const _info = console.info;

          function sendToParent(type, args) {
            const stringifiedArgs = Array.from(args).map(arg => {
              if (arg === undefined) return 'undefined';
              if (arg === null) return 'null';
              if (typeof arg === 'object') {
                try { return JSON.stringify(arg); } catch(e) { return String(arg); }
              }
              return String(arg);
            }).join(' ');
            
            window.parent.postMessage({
              source: 'leenout-sandbox',
              type: type,
              message: stringifiedArgs,
              timestamp: new Date().toISOString()
            }, '*');
          }

          console.log = function() {
            sendToParent('log', arguments);
            _log.apply(console, arguments);
          };
          console.error = function() {
            sendToParent('error', arguments);
            _error.apply(console, arguments);
          };
          console.warn = function() {
            sendToParent('warn', arguments);
            _warn.apply(console, arguments);
          };
          console.info = function() {
            sendToParent('info', arguments);
            _info.apply(console, arguments);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            sendToParent('error', [\`Runtime Error: \${message} at \${lineno}:\${colno}\`]);
            return false;
          };

          window.addEventListener('unhandledrejection', function(event) {
            sendToParent('error', [\`Unhandled Promise Rejection: \${event.reason}\`]);
          });
        })();
      </script>
    `;

    // Inject interceptor right at the start of htmlContent
    let finalHtml = htmlContent;
    if (finalHtml.includes("<head>")) {
      finalHtml = finalHtml.replace("<head>", `<head>\${consoleInterceptorScript}`);
    } else if (finalHtml.includes("<html>")) {
      finalHtml = finalHtml.replace("<html>", `<html>\${consoleInterceptorScript}`);
    } else {
      finalHtml = consoleInterceptorScript + finalHtml;
    }

    return finalHtml;
  }, [files]);

  // Clear logs when preview is recompiled/reloaded
  useEffect(() => {
    setLogs([]);
  }, [compiledSrcDoc]);

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
      <div className="flex-1 relative bg-[#111111] overflow-hidden flex flex-col">
        
        {/* Render Sandbox preview */}
        <div className="flex-1 relative">
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

        {/* DevTools Collapsible Console Drawer */}
        <div className={`border-t border-border bg-[#0d0d0d] font-mono transition-all flex flex-col shrink-0 ${consoleExpanded ? "h-60" : "h-10"}`}>
          {/* Drawer header toggle */}
          <div 
            onClick={() => setConsoleExpanded(!consoleExpanded)}
            className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-[#070707] cursor-pointer hover:bg-[#111] transition-colors shrink-0"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">
                Console DevTools
              </span>
              {logs.length > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold select-none ${
                  logs.some(l => l.type === 'error') ? 'bg-accent2 text-text-primary' : 'bg-accent text-bg'
                }`}>
                  {logs.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {consoleExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogs([]);
                  }}
                  className="text-[9px] uppercase font-bold text-text-dim hover:text-text-primary bg-transparent border-none cursor-pointer hover:underline"
                >
                  Clear Logs
                </button>
              )}
              <span className="text-[9px] text-text-muted select-none font-bold">
                {consoleExpanded ? "[COLLAPSE]" : "[EXPAND]"}
              </span>
            </div>
          </div>

          {/* Drawer logs terminal view */}
          {consoleExpanded && (
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5 text-[11px] leading-relaxed select-text selection:bg-accent/30 bg-[#0a0a0a]">
              {logs.length === 0 ? (
                <div className="text-text-dim italic text-center py-12 select-none">
                  Console is empty. Execute console.log() or save files to trigger live logs.
                </div>
              ) : (
                logs.map((log, idx) => {
                  let colorClass = "text-text-muted border-l border-border pl-2";
                  if (log.type === "error") colorClass = "text-accent2 border-l border-accent2 pl-2 bg-accent2/5";
                  if (log.type === "warn") colorClass = "text-yellow-500 border-l border-yellow-500 pl-2 bg-yellow-500/5";
                  if (log.type === "info") colorClass = "text-accent border-l border-accent pl-2";

                  return (
                    <div key={idx} className={`font-mono py-0.5 break-all ${colorClass}`}>
                      <span className="text-[8px] text-text-dim select-none mr-2 font-mono">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span>{log.message}</span>
                    </div>
                  );
                })
              )}
              <div id="console-bottom-anchor" />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
