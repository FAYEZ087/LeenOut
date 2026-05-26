"use client";

import React, { useState } from "react";
import { 
  Folder, FolderOpen, File, FileCode, Trash2, ChevronRight, ChevronDown, Check, X, FolderPlus, FilePlus, Edit2 
} from "lucide-react";

export interface ProjectFile {
  id: string;
  filename: string;
  filepath: string;
  content: string;
}

interface FileTreeProps {
  files: ProjectFile[];
  activeFileId: string | null;
  onSelectFile: (file: ProjectFile) => void;
  onCreateFile: (filepath: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onRenameFile: (fileId: string, newFilepath: string) => Promise<void>;
  onRenameFolder: (oldFolderPath: string, newFolderPath: string) => Promise<void>;
  onCreateFolder: (folderPath: string) => Promise<void>;
  isEditable: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: { [key: string]: TreeNode };
  fileId?: string;
  rawFile?: ProjectFile;
}

export default function FileTree({ 
  files, 
  activeFileId, 
  onSelectFile, 
  onCreateFile, 
  onDeleteFile,
  onRenameFile,
  onRenameFolder,
  onCreateFolder,
  isEditable 
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<{ [path: string]: boolean }>({ "": true });
  
  // Creation input states
  const [showAddFileInput, setShowAddFileInput] = useState(false);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [newFolderPath, setNewFolderPath] = useState("");
  const [creating, setCreating] = useState(false);

  // Renaming states
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [renaming, setRenaming] = useState(false);

  // 1. Convert flat array of absolute paths into deep tree structure
  const buildTree = (): TreeNode => {
    const root: TreeNode = { name: "root", path: "", isFolder: true, children: {} };
    
    files.forEach(file => {
      const parts = file.filepath.split("/");
      let current = root;
      let currentPath = "";
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isLast = index === parts.length - 1;
        
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: currentPath,
            isFolder: !isLast,
            children: {},
            fileId: isLast ? file.id : undefined,
            rawFile: isLast ? file : undefined
          };
        }
        current = current.children[part];
      });
    });
    
    return root;
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCreateFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilePath.trim()) return;

    setCreating(true);
    try {
      await onCreateFile(newFilePath.trim());
      setNewFilePath("");
      setShowAddFileInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderPath.trim()) return;

    setCreating(true);
    try {
      await onCreateFolder(newFolderPath.trim());
      setNewFolderPath("");
      setShowAddFolderInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const startRenaming = (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPath(node.path);
    setEditValue(node.name);
  };

  const handleRenameSubmit = async (node: TreeNode, e: React.FormEvent) => {
    e.preventDefault();
    if (!editValue.trim() || editValue.trim() === node.name) {
      setEditingPath(null);
      return;
    }

    setRenaming(true);
    try {
      const parts = node.path.split("/");
      parts[parts.length - 1] = editValue.trim();
      const newPath = parts.join("/");

      if (node.isFolder) {
        await onRenameFolder(node.path, newPath);
      } else if (node.fileId) {
        await onRenameFile(node.fileId, newPath);
      }
      setEditingPath(null);
    } catch (err) {
      console.error(err);
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteFolder = async (folderPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Wipe folder "${folderPath}" and all of its files permanently?`)) {
      setCreating(true);
      try {
        const targets = files.filter(f => f.filepath === folderPath || f.filepath.startsWith(`${folderPath}/`));
        for (const f of targets) {
          await onDeleteFile(f.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCreating(false);
      }
    }
  };

  // Get Lucide Icon depending on file type extension
  const getFileIcon = (filename: string, isActive: boolean) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    const colorClass = isActive ? "text-accent" : "text-text-muted";
    
    switch (ext) {
      case "html":
      case "htm":
      case "css":
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FileCode className={`h-4 w-4 ${colorClass} shrink-0`} />;
      default:
        return <File className={`h-4 w-4 ${colorClass} shrink-0`} />;
    }
  };

  // Recursive component to render tree nodes
  const renderNode = (node: TreeNode, depth: number = 0) => {
    const isEditing = editingPath === node.path;

    if (node.name === "root") {
      // Sort children: Folders first, then alphabetically
      const sortedKeys = Object.keys(node.children).sort((a, b) => {
        const nodeA = node.children[a];
        const nodeB = node.children[b];
        if (nodeA.isFolder && !nodeB.isFolder) return -1;
        if (!nodeA.isFolder && nodeB.isFolder) return 1;
        return a.localeCompare(b);
      });
      return <div className="space-y-0.5">{sortedKeys.map(key => renderNode(node.children[key], 0))}</div>;
    }

    // Hide placeholder .keep or .placeholder files so empty folders look clean
    if (!node.isFolder && (node.name === ".keep" || node.name === ".placeholder")) {
      return null;
    }

    if (node.isFolder) {
      const sortedKeys = Object.keys(node.children).sort((a, b) => {
        const nodeA = node.children[a];
        const nodeB = node.children[b];
        if (nodeA.isFolder && !nodeB.isFolder) return -1;
        if (!nodeA.isFolder && nodeB.isFolder) return 1;
        return a.localeCompare(b);
      });
      
      const isExpanded = expandedFolders[node.path];

      return (
        <div key={node.path} className="select-none">
          {/* Folder row */}
          {isEditing ? (
            <form 
              onSubmit={(e) => handleRenameSubmit(node, e)}
              className="flex items-center gap-1 py-0.5 px-2 bg-surface2 border border-accent/25"
              style={{ marginLeft: `${depth * 12 + 8}px` }}
            >
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.replace(/[^a-zA-Z0-9_\-\.]/g, ""))}
                required
                disabled={renaming}
                autoFocus
                className="flex-1 bg-transparent text-text-primary text-xs focus:outline-none font-mono py-0.5"
              />
              <button type="submit" disabled={renaming} className="text-accent hover:text-white p-0.5">
                <Check className="h-3 w-3" />
              </button>
              <button type="button" onClick={() => setEditingPath(null)} className="text-accent2 hover:text-white p-0.5">
                <X className="h-3 w-3" />
              </button>
            </form>
          ) : (
            <div 
              onClick={() => toggleFolder(node.path)}
              className="flex items-center justify-between py-1 px-2 hover:bg-surface2 cursor-pointer transition-colors text-xs font-semibold uppercase tracking-wider text-text-muted font-syne group"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-text-dim shrink-0 group-hover:text-text-primary" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-text-dim shrink-0 group-hover:text-text-primary" />
                )}
                
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-accent/80 shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 text-text-muted shrink-0" />
                )}
                
                <span className="truncate group-hover:text-text-primary transition-colors">{node.name}</span>
              </div>

              {isEditable && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startRenaming(node, e)}
                    className="text-text-dim hover:text-accent p-0.5"
                    title="Rename Folder"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFolder(node.path, e)}
                    className="text-text-dim hover:text-accent2 p-0.5"
                    title="Delete Folder"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Folder contents */}
          {isExpanded && (
            <div className="space-y-0.5">
              {sortedKeys.map(key => renderNode(node.children[key], depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Leaf File Node
    const isActive = node.fileId === activeFileId;
    
    return isEditing ? (
      <form 
        key={node.path}
        onSubmit={(e) => handleRenameSubmit(node, e)}
        className="flex items-center gap-1 py-0.5 px-2 bg-surface2 border border-accent/25"
        style={{ marginLeft: `${depth * 12 + 8}px` }}
      >
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value.replace(/[^a-zA-Z0-9_\-\.]/g, ""))}
          required
          disabled={renaming}
          autoFocus
          className="flex-1 bg-transparent text-text-primary text-xs focus:outline-none font-mono py-0.5"
        />
        <button type="submit" disabled={renaming} className="text-accent hover:text-white p-0.5">
          <Check className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => setEditingPath(null)} className="text-accent2 hover:text-white p-0.5">
          <X className="h-3 w-3" />
        </button>
      </form>
    ) : (
      <div 
        key={node.path}
        onClick={() => node.rawFile && onSelectFile(node.rawFile)}
        className={`flex items-center justify-between py-1 px-2 cursor-pointer transition-all border-l-2 text-xs font-mono group ${
          isActive 
            ? "bg-accent/5 border-accent text-accent font-semibold" 
            : "border-transparent text-text-primary/90 hover:bg-surface2 hover:text-text-primary"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {getFileIcon(node.name, isActive)}
          <span className="truncate">{node.name}</span>
        </div>

        {isEditable && node.fileId && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => startRenaming(node, e)}
              className="text-text-dim hover:text-accent p-0.5 cursor-pointer shrink-0"
              title="Rename File"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (confirm(`Wipe file "${node.name}" permanently?`)) {
                  await onDeleteFile(node.fileId!);
                }
              }}
              className="text-text-dim hover:text-accent2 p-0.5 cursor-pointer shrink-0"
              title="Delete File"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree();

  return (
    <div className="h-full flex flex-col justify-between font-mono">
      
      {/* Visual File listing */}
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4 select-none">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
            Workspace Explorer
          </span>
          
          {isEditable && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setShowAddFileInput(!showAddFileInput);
                  setShowAddFolderInput(false);
                }}
                className={`p-1 cursor-pointer transition-colors ${showAddFileInput ? "text-accent" : "text-text-muted hover:text-accent"}`}
                title="Add New File"
              >
                <FilePlus className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setShowAddFolderInput(!showAddFolderInput);
                  setShowAddFileInput(false);
                }}
                className={`p-1 cursor-pointer transition-colors ${showAddFolderInput ? "text-accent" : "text-text-muted hover:text-accent"}`}
                title="Add New Folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* New File Creation Input Form */}
        {showAddFileInput && (
          <form onSubmit={handleCreateFileSubmit} className="mb-4 bg-surface p-3.5 border border-border animate-fade-in space-y-2">
            <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">
              New File Name/Path
            </label>
            <input
              type="text"
              placeholder="e.g. index.html, styles/theme.css"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value.replace(/[^a-zA-Z0-9_\-\.\/]/g, ""))}
              required
              disabled={creating}
              autoFocus
              className="w-full bg-surface2 border border-border text-text-primary px-2.5 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono"
            />
            <div className="flex justify-end gap-2 text-[10px]">
              <button 
                type="button" 
                onClick={() => setShowAddFileInput(false)}
                className="text-text-muted hover:text-accent2 px-2 py-1 uppercase font-semibold cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button 
                type="submit"
                disabled={creating || !newFilePath.trim()}
                className="text-accent hover:underline px-2 py-1 uppercase font-bold cursor-pointer disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        {/* New Folder Creation Input Form */}
        {showAddFolderInput && (
          <form onSubmit={handleCreateFolderSubmit} className="mb-4 bg-surface p-3.5 border border-border animate-fade-in space-y-2">
            <label className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">
              New Folder Name/Path
            </label>
            <input
              type="text"
              placeholder="e.g. assets, src/components"
              value={newFolderPath}
              onChange={(e) => setNewFolderPath(e.target.value.replace(/[^a-zA-Z0-9_\-\/]/g, ""))}
              required
              disabled={creating}
              autoFocus
              className="w-full bg-surface2 border border-border text-text-primary px-2.5 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono"
            />
            <div className="flex justify-end gap-2 text-[10px]">
              <button 
                type="button" 
                onClick={() => setShowAddFolderInput(false)}
                className="text-text-muted hover:text-accent2 px-2 py-1 uppercase font-semibold cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button 
                type="submit"
                disabled={creating || !newFolderPath.trim()}
                className="text-accent hover:underline px-2 py-1 uppercase font-bold cursor-pointer disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        )}

        {files.length === 0 ? (
          <div className="text-center py-8 text-text-dim text-xs italic">
            Workspace is empty. Create a file to begin coding.
          </div>
        ) : (
          renderNode(treeData)
        )}
      </div>
      
    </div>
  );
}
