"use client";

import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Loader2, Lock, Maximize2, Minimize2 } from "lucide-react";

interface MonacoWrapProps {
  content: string;
  filepath: string;
  onChange: (value: string | undefined) => void;
  onSave: () => void;
  isReadOnly: boolean;
  editorState: "normal" | "maximized" | "minimized";
  onChangeEditorState: (state: "normal" | "maximized" | "minimized") => void;
}

export default function MonacoWrap({ 
  content, 
  filepath, 
  onChange, 
  onSave, 
  isReadOnly,
  editorState,
  onChangeEditorState
}: MonacoWrapProps) {
  const editorRef = useRef<any>(null);

  // Keep onSave in a ref to avoid stale closure references in Monaco commands
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Parse filename to match Monaco language highlighter models
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
      case "md":
        return "markdown";
      case "py":
        return "python";
      case "rs":
        return "rust";
      default:
        return "plaintext";
    }
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // Define custom Acid Dark HSL developer theme (WOW Aesthetics)
    monaco.editor.defineTheme("acidDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "666666", fontStyle: "italic" },
        { token: "keyword", foreground: "cbd637", fontWeight: "bold" }, // Softer lime keywords
        { token: "string", foreground: "ff6b35" }, // Orange Burn strings
        { token: "number", foreground: "ff6b35" },
        { token: "regexp", foreground: "ff6b35" },
        { token: "type", foreground: "f0f0f0" },
        { token: "class", foreground: "f0f0f0" },
        { token: "function", foreground: "f0f0f0", fontWeight: "bold" }
      ],
      colors: {
        "editor.background": "#111111", // Surface dark background
        "editor.foreground": "#f0f0f0", // Clean white foreground
        "editor.lineHighlightBackground": "#161616", // Subtle active line highlight
        "editorCursor.foreground": "#cbd637", // Softer neon cursor
        "editor.selectionBackground": "#2a2a2a",
        "editor.inactiveSelectionBackground": "#222222",
        "editorGutter.background": "#111111",
        "editorLineNumber.foreground": "#333333", // Dim line numbers
        "editorLineNumber.activeForeground": "#cbd637", // Softer active line number
        "editorWidget.background": "#1a1a1a",
        "editorWidget.border": "#222222"
      }
    });

    // Apply the newly registered theme
    monaco.editor.setTheme("acidDark");

    // Pro-Tip: Hook custom Ctrl + S keystroke intercept to trigger save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSaveRef.current();
    });
  };

  return (
    <div className="h-full flex flex-col relative bg-[#111111]">
      
      {/* File status ribbon header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#0d0d0d] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-accent rounded-full animate-pulse" />
          <span className="font-mono text-xs font-semibold text-text-primary truncate max-w-[120px] sm:max-w-[200px]">
            {filepath || "untitled"}
          </span>
          {isReadOnly && (
            <span className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-accent2 bg-accent2/5 border border-accent2/30 px-1.5 py-0.5 font-bold font-syne">
              <Lock className="h-2.5 w-2.5" />
              <span>Read-Only</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold hidden sm:inline">
            {getLanguage(filepath)} syntax
          </span>
          
          <div className="h-3 w-px bg-border hidden sm:block" />
          
          <div className="flex items-center gap-1.5">
            {/* Minimize Button */}
            <button
              type="button"
              onClick={() => onChangeEditorState("minimized")}
              title="Minimize Editor"
              className="p-1 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            
            {/* Maximize Toggle */}
            <button
              type="button"
              onClick={() => onChangeEditorState(editorState === "maximized" ? "normal" : "maximized")}
              title={editorState === "maximized" ? "Restore Editor Window" : "Maximize Editor"}
              className="p-1 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Monaco Editor Wrapper */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={getLanguage(filepath)}
          value={content}
          onChange={onChange}
          onMount={handleEditorDidMount}
          loading={
            <div className="absolute inset-0 flex items-center justify-center bg-surface text-xs text-text-muted gap-2 font-mono uppercase tracking-widest">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span>Instantiating IDE...</span>
            </div>
          }
          options={{
            readOnly: isReadOnly,
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            minimap: { enabled: false }, // Cut clutter
            scrollbar: {
              vertical: "visible",
              horizontal: "visible",
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 0,
            folding: true,
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
            wordWrap: "on",
            renderLineHighlight: "all"
          }}
        />
      </div>

    </div>
  );
}
