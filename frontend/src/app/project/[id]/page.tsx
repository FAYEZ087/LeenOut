"use client";

import React, { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Loader2, Play, ShieldAlert, ArrowLeft, Save, Sparkles, Terminal, FileCode, CheckCircle2, Folder as FolderIcon, Settings, Maximize2, Minimize2, GitFork 
} from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";

// Sub-components imports
import FileTree, { ProjectFile } from "./file-tree";
import MonacoWrap from "./monaco-wrap";
import PreviewPane from "./preview-pane";
import AdminPanel from "./admin-panel";

// Mock Fallbacks in case Supabase project fails or for quick local preview
const DEFAULT_FILES: ProjectFile[] = [
  {
    id: "file-html",
    filename: "index.html",
    filepath: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leenout Interactive Studio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="workspace">
    <header>
      <div class="logo">Leen<span>out</span></div>
      <div class="badge">Live Playground</div>
    </header>
    
    <main>
      <h1>Stranger, welcome to the <span class="neon-text">Workspace</span>.</h1>
      <p>This neon dark boilerplate renders in real-time. Edit files in the Monaco pane, hit <kbd>Ctrl + S</kbd>, and watch the DOM re-compile with sub-millisecond hot-reload latency.</p>
      
      <div class="interaction-card">
        <button id="action-btn">Click to Execute app.js</button>
        <p id="counter-msg">Keystroke locks: ACTIVE</p>
      </div>
    </main>

    <footer>
      <span>Phase 2 Sandbox Iframe compiler • Secured sandbox environment</span>
    </footer>
  </div>

  <script src="app.js"></script>
</body>
</html>`
  },
  {
    id: "file-css",
    filename: "style.css",
    filepath: "style.css",
    content: `/* Leenout HSL Acid Dark Design System */
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --border: #222222;
  --accent: #cbd637; /* Softer Lime-Yellow */
  --accent-orange: #ff6b35; /* Orange Burn */
  --text: #f0f0f0;
  --muted: #888888;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'DM Mono', monospace, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

body::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  opacity: 0.3;
}

.workspace {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 40px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
  position: relative;
}

.workspace::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, var(--accent), var(--accent-orange));
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.logo {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -1px;
}

.logo span {
  color: var(--accent);
}

.badge {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 4px 10px;
}

h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 15px;
  line-height: 1.2;
}

.neon-text {
  color: var(--accent-orange);
}

p {
  color: var(--muted);
  margin-bottom: 24px;
  font-size: 13px;
}

kbd {
  background: #1a1a1a;
  border: 1px solid var(--border);
  padding: 2px 6px;
  font-size: 11px;
  color: var(--accent);
}

.interaction-card {
  background: #070707;
  border: 1px solid var(--border);
  padding: 24px;
  text-align: center;
}

button {
  background: var(--accent);
  color: var(--bg);
  border: none;
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

button:hover {
  background: var(--accent-orange);
  color: var(--text);
}

#counter-msg {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  color: var(--accent-orange);
}

footer {
  margin-top: 30px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
  font-size: 10px;
  color: #444444;
  text-align: center;
}`
  },
  {
    id: "file-js",
    filename: "app.js",
    filepath: "app.js",
    content: `// Dynamic Interactive Script

const actionBtn = document.getElementById('action-btn');
const counterMsg = document.getElementById('counter-msg');

let clickCount = 0;

if (actionBtn && counterMsg) {
  actionBtn.addEventListener('click', () => {
    clickCount++;
    actionBtn.textContent = 'Script trigger acknowledged!';
    actionBtn.style.background = '#ff6b35';
    actionBtn.style.color = '#f0f0f0';
    
    counterMsg.textContent = \`Edits executed: \${clickCount} times in local memory\`;
    
    console.log(\`[STUDIO] app.js triggered clickCount: \${clickCount}\`);
    
    setTimeout(() => {
      actionBtn.textContent = 'Click to Execute app.js';
      actionBtn.style.background = '#cbd637';
      actionBtn.style.color = '#0a0a0a';
    }, 1500);
  });
}`
  }
];

// Robust path normalization to prevent leading/trailing slashes, relative dots, and empty duplicates
const normalizeFilepath = (path: string): string => {
  let clean = path.trim();
  // Strip leading ./ or / segments
  clean = clean.replace(/^(\.\/|\/)+/, "");
  // Strip trailing slashes
  clean = clean.replace(/\/+$/, "");
  // Collapse multiple consecutive slashes
  clean = clean.replace(/\/+/g, "/");
  // Clean middle relative dots
  clean = clean.replace(/\/\.\//g, "/");
  return clean;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudioPage({ params }: PageProps) {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };
  const { id: projectId } = use(params);

  // Auth and Project states
  const [user, setUser] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [forkSource, setForkSource] = useState<any>(null);
  const [forking, setForking] = useState(false);

  // Editor states
  const [localContent, setLocalContent] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditable, setIsEditable] = useState(true); // Default to true for sandbox previews
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);


  // Phase 3 States
  const [hasActiveWindow, setHasActiveWindow] = useState(true);
  const [allowedFiles, setAllowedFiles] = useState<string[] | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"explorer" | "admin">("explorer");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [totalSeconds, setTotalSeconds] = useState<number | null>(null);
  const [editorState, setEditorState] = useState<"normal" | "maximized" | "minimized">("normal");
  const [explorerState, setExplorerState] = useState<"normal" | "collapsed" | "maximized">("normal");
  const [previewState, setPreviewState] = useState<"normal" | "collapsed" | "maximized">("normal");

  const handleMaximizePane = (pane: "explorer" | "editor" | "preview") => {
    if (pane === "explorer") {
      setExplorerState(prev => prev === "maximized" ? "normal" : "maximized");
      setEditorState("normal");
      setPreviewState("normal");
    } else if (pane === "editor") {
      setEditorState(prev => prev === "maximized" ? "normal" : "maximized");
      setExplorerState("normal");
      setPreviewState("normal");
    } else if (pane === "preview") {
      setPreviewState(prev => prev === "maximized" ? "normal" : "maximized");
      setExplorerState("normal");
      setEditorState("normal");
    }
  };

  const handleCollapsePane = (pane: "explorer" | "editor" | "preview", collapse: boolean) => {
    if (pane === "explorer") {
      setExplorerState(collapse ? "collapsed" : "normal");
    } else if (pane === "editor") {
      setEditorState(collapse ? "minimized" : "normal");
    } else if (pane === "preview") {
      setPreviewState(collapse ? "collapsed" : "normal");
    }
  };

  // Real-time Chat & File Sync States
  const [socket, setSocket] = useState<any>(null);
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "chat">("preview");
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    projectId: string;
    userId: string;
    username: string;
    avatarUrl: string;
    text: string;
    role: 'owner' | 'contributor' | 'guest';
    timestamp: string;
  }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState("");

  // 1. Establish secure auth session state listener and profile resolver
  useEffect(() => {
    const fetchProfileAndSetUser = async (sessionUser: any) => {
      if (sessionUser) {
        setUser(sessionUser);
        try {
          // Fetch profile details immediately to prevent race conditions showing email name
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", sessionUser.id)
            .single();
          
          if (profileData) {
            setProfileUsername(profileData.username);
            setProfileAvatarUrl(profileData.avatar_url || "");
          }
        } catch (e) {
          // ignore
        }
      } else {
        setUser(null);
        setProfileUsername("");
        setProfileAvatarUrl("");
      }
      setSessionLoaded(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfileAndSetUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfileAndSetUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Project & Files from Supabase (Only after Auth state resolves)
  useEffect(() => {
    if (!sessionLoaded) return;

    const loadProjectData = async () => {
      try {
        setLoading(true);

        // Fetch project info
        const { data: projData, error: projError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projError || !projData) {
          setProject(null);
          setLoading(false);
          return;
        }

        setProject(projData);

        // Fetch fork source details if it exists
        if (projData.forked_from_id) {
          try {
            const { data: parentProj } = await supabase
              .from("projects")
              .select(`
                name,
                profiles:owner_id ( username )
              `)
              .eq("id", projData.forked_from_id)
              .single();

            if (parentProj) {
              setForkSource({
                id: projData.forked_from_id,
                name: parentProj.name,
                ownerUsername: (parentProj as any).profiles?.username || "owner"
              });
            }
          } catch (e) {
            console.warn("Parent project fetch failed:", e);
          }
        } else {
          setForkSource(null);
        }


        // Fetch project files
        const { data: fileData, error: fileError } = await supabase
          .from("project_files")
          .select("*")
          .eq("project_id", projectId);

        // Determine if user has permission to write edit locks (Phase 3 Active Window + Allowed Files)
        const currentUser = (await supabase.auth.getSession()).data.session?.user;
        
        // Fetch current user's profile details
        if (currentUser) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", currentUser.id)
            .single();
          if (profileData) {
            setProfileUsername(profileData.username);
            setProfileAvatarUrl(profileData.avatar_url || "");
          }
        }

        const isOwner = currentUser && projData.owner_id === currentUser.id;

        let allowedFilesList: string[] | null = null;
        let hasActiveSlot = false;

        if (currentUser && !isOwner) {
          // Check contributor status & permitted files
          const { data: contribData } = await supabase
            .from("contributors")
            .select("allowed_files")
            .eq("project_id", projectId)
            .eq("user_id", currentUser.id)
            .eq("status", "active")
            .single();
          
          if (contribData) {
            allowedFilesList = contribData.allowed_files;
            
            // Check active edit window
            const nowIso = new Date().toISOString();
            const { data: activeWin } = await supabase
              .from("edit_windows")
              .select("id, end_time")
              .eq("project_id", projectId)
              .eq("contributor_id", currentUser.id)
              .in("status", ["active", "scheduled"])
              .lte("start_time", nowIso)
              .gte("end_time", nowIso)
              .single();
            
            hasActiveSlot = !!activeWin;
            if (activeWin) {
              const endMs = new Date(activeWin.end_time).getTime();
              const nowMs = new Date().getTime();
              const diffSec = Math.max(0, Math.floor((endMs - nowMs) / 1000));
              setSecondsLeft(diffSec);
              setTotalSeconds(prev => prev === null ? diffSec : prev);
            }
          }
        }

        const activeWinState = !!isOwner || hasActiveSlot;
        setHasActiveWindow(activeWinState);
        setAllowedFiles(allowedFilesList);

        if (fileData && !fileError && fileData.length > 0) {
          setFiles(fileData);
          // Set index.html as default active file
          const indexFile = fileData.find(f => f.filepath === "index.html" || f.filename === "index.html") || fileData[0];
          setActiveFile(indexFile);
          setLocalContent(indexFile.content);
          
          // Determine if editable based on active window & allowed files
          const isIndexEditable = isOwner || (hasActiveSlot && (allowedFilesList === null || allowedFilesList.includes(indexFile.filepath)));
          setIsEditable(isIndexEditable);
        } else if (isOwner && currentUser) {
          // SELF-HEALING: If owner opens their own project and it has 0 files, pre-populate them in the DB!
          console.log("[STUDIO] Self-healing active: pre-populating files for project:", projectId);
          const { data: insertedFiles, error: insertError } = await supabase
            .from("project_files")
            .insert(
              DEFAULT_FILES.map(file => ({
                project_id: projectId,
                filename: file.filename,
                filepath: file.filepath,
                content: file.content,
                last_edited_by: currentUser.id
              }))
            )
            .select("*");

          if (insertedFiles && !insertError && insertedFiles.length > 0) {
            setFiles(insertedFiles);
            const indexFile = insertedFiles.find(f => f.filepath === "index.html" || f.filename === "index.html") || insertedFiles[0];
            setActiveFile(indexFile);
            setLocalContent(indexFile.content);
          } else {
            setFiles([]);
            setActiveFile(null);
            setLocalContent("");
          }
        } else {
          // Guest or non-owner: no files exist in the database, keep it empty!
          setFiles([]);
          setActiveFile(null);
          setLocalContent("");
        }

      } catch (e) {
        // Fail silently without leaking database error traces to browser console
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, sessionLoaded]);

  // 3. Contributor slot countdown ticker interval
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Slot has expired! Trigger Monaco lock and display message
          setHasActiveWindow(false);
          setIsEditable(false);
          setActionMessage("Your contributor editing session has expired.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft]);

  // Establish Socket.io real-time connection
  useEffect(() => {
    if (!project || !user) return;

    let socketClient: any = null;

    const connectSocket = async () => {
      // Connect to the Socket.io server
      const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      socketClient = io(socketUrl, {
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"]
      });

      setSocket(socketClient);

      // Determine user role for chat display
      const userRole = project.owner_id === user.id 
        ? "owner" 
        : allowedFiles !== null || secondsLeft !== null 
          ? "contributor" 
          : "guest";

      const joinRoom = () => {
        socketClient.emit("join_project_room", {
          projectId: project.id,
          userId: user.id,
          username: profileUsername || user.email?.split("@")[0] || "Developer",
          avatarUrl: profileAvatarUrl || "",
          role: userRole
        });
      };

      socketClient.on("connect", () => {
        console.log("[SOCKET CLIENT] Connected to realtime server. Joining room:", project.id);
        joinRoom();
      });

      if (socketClient.connected) {
        joinRoom();
      }

      socketClient.on("room_history", (history: any[]) => {
        setChatMessages(history);
      });

      socketClient.on("receive_message", (msg: any) => {
        setChatMessages(prev => {
          // Prevent duplicate messages
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });

        // Increment unread badge if viewing preview tab
        setActiveRightTab(currentTab => {
          if (currentTab !== "chat") {
            setUnreadMessages(u => u + 1);
          }
          return currentTab;
        });
      });

      // Handle real-time file update broadcasts
      socketClient.on("file_updated", (data: { filepath: string; content: string; senderUsername: string }) => {
        // 1. Show notification toast
        setActionMessage(`Realtime: ${data.senderUsername} saved ${data.filepath}`);
        setTimeout(() => setActionMessage(null), 4000);

        // 2. Update local state files
        setFiles(prev => prev.map(f => 
          f.filepath === data.filepath ? { ...f, content: data.content } : f
        ));

        // 3. If the open/active file is the one that updated, update its local editor value
        setActiveFile(currentFile => {
          if (currentFile && currentFile.filepath === data.filepath) {
            setLocalContent(data.content);
            setUnsavedChanges(false);
            return { ...currentFile, content: data.content };
          }
          return currentFile;
        });
      });
    };

    connectSocket();

    return () => {
      if (socketClient) {
        socketClient.disconnect();
      }
    };
  }, [project, user, allowedFiles, secondsLeft, profileUsername, profileAvatarUrl]);

  // Auto-scroll chat viewport to bottom on new transmissions
  useEffect(() => {
    if (activeRightTab === "chat") {
      const anchor = document.getElementById("chat-anchor");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [chatMessages, activeRightTab]);

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !chatInput.trim() || !project || !user) return;

    const userRole = project.owner_id === user.id 
      ? "owner" 
      : allowedFiles !== null || secondsLeft !== null 
        ? "contributor" 
        : "guest";

    socket.emit("send_message", {
      projectId: project.id,
      userId: user.id,
      username: profileUsername || user.email?.split("@")[0] || "Developer",
      avatarUrl: profileAvatarUrl || "",
      text: chatInput,
      role: userRole
    });

    setChatInput("");
  };

  // Handle active file change inside editor
  const handleSelectFile = (file: ProjectFile) => {
    if (unsavedChanges) {
      if (!confirm("Discard unsaved changes to active file?")) {
        return;
      }
    }
    setActiveFile(file);
    setLocalContent(file.content);
    setUnsavedChanges(false);
    
    // Evaluate file-specific edit lock gating dynamically
    setIsEditable(checkFileEditability(file.filepath, hasActiveWindow, allowedFiles));
  };

  const handleEditorChange = (value: string | undefined) => {
    const updatedValue = value || "";
    setLocalContent(updatedValue);
    setUnsavedChanges(updatedValue !== activeFile?.content);
  };

  // Triggered by Ctrl + S or Save button clicks
  const handleSaveActiveFile = async () => {
    if (!activeFile || !isEditable) return;

    setSaving(true);
    setActionMessage(null);

    try {
      // 1. Commit changes to Supabase Postgres (if authenticated & not in playground sandbox)
      if (user && project.owner_id !== "owner-stone") {
        const { data, error } = await supabase
          .from("project_files")
          .update({
            content: localContent,
            last_edited_by: user.id,
            last_edited_at: new Date().toISOString()
          })
          .eq("id", activeFile.id)
          .select();

        if (error) {
          throw error;
        }

        console.log("[STUDIO SAVE SUCCESS] Supabase saved rows:", data);
        if (!data || data.length === 0) {
          console.warn("[STUDIO SAVE WARNING] Update succeeded but 0 rows were updated. Check file ID match:", activeFile.id);
        }

        // --- PHASE 3 snap shot logger ---
        const { error: sessionError } = await supabase
          .from("edit_sessions")
          .insert({
            project_id: project.id,
            file_id: activeFile.id,
            editor_id: user.id,
            content_snapshot: localContent
          });
      }

      // 2. Commit changes inside local React state array
      setFiles(prev => prev.map(f => 
        f.id === activeFile.id ? { ...f, content: localContent } : f
      ));

      // 3. Update active file snapshot
      setActiveFile(prev => prev ? { ...prev, content: localContent } : null);
      setUnsavedChanges(false);

      setActionMessage("Changes committed successfully!");
      setTimeout(() => setActionMessage(null), 3000);

      // 4. Broadcast the saved file changes via Socket.io
      if (socket) {
        socket.emit("file_saved", {
          projectId: project.id,
          filepath: activeFile.filepath,
          content: localContent,
          senderId: user.id,
          senderUsername: profileUsername || user.email?.split("@")[0] || "Collaborator"
        });
      }

    } catch (err: any) {
      setActionMessage("An unexpected error occurred while saving your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Global Ctrl + S / Cmd + S Hotkey listener to intercept browser save prompts and trigger commits
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isEditable && !saving && activeFile && unsavedChanges) {
          handleSaveActiveFile();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, { capture: true });
    };
  }, [handleSaveActiveFile, isEditable, saving, activeFile, unsavedChanges]);

  // Helper to pre-populate starter code snippet based on file extensions
  const getStarterContentForFile = (filepath: string) => {
    const ext = filepath.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "html":
      case "htm":
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Document</title>
  <!-- Link stylesheets relatively — compiled dynamically -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="card" style="font-family: monospace; background: #111; color: #f0f0f0; border: 1px dashed #e8ff47; padding: 32px; max-width: 400px; margin: 60px auto; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <h2 style="color: #e8ff47; margin-top: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">New HTML Document</h2>
    <p style="color: #888; font-size: 12px; line-height: 1.6;">Your newly created HTML page compiles in real-time. Link your style.css and app.js scripts to build interactive custom pages!</p>
  </div>
  
  <script src="app.js"></script>
</body>
</html>`;
      case "css":
        return `/* New Stylesheet */
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --border: #222222;
  --accent: #e8ff47; /* Acid Yellow */
  --accent-orange: #ff6b35; /* Orange Burn */
  --text: #f0f0f0;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: monospace;
  padding: 20px;
}`;
      case "js":
      case "jsx":
        return `// New Interactive Script
console.log("[STUDIO] ${filepath} script loaded successfully!");
`;
      default:
        return "";
    }
  };

  const handleCreateNewFile = async (rawFilepath: string) => {
    if (!isEditable) return;

    const filepath = normalizeFilepath(rawFilepath);
    if (!filepath) {
      alert("Invalid file path.");
      return;
    }

    // Check if file already exists in local workspace cache
    const fileExists = files.some(f => f.filepath === filepath);
    if (fileExists) {
      alert(`A file named "${filepath}" already exists in this project.`);
      return;
    }

    try {
      const filename = filepath.split("/").pop() || "untitled";
      const newId = `file-${Math.random().toString(36).substr(2, 9)}`;
      const starterContent = getStarterContentForFile(filepath);
      
      const newFile: ProjectFile = {
        id: newId,
        filename,
        filepath,
        content: starterContent
      };

      if (user && project.owner_id !== "owner-stone") {
        // Authenticated database insertion
        const { data, error } = await supabase
          .from("project_files")
          .insert({
            project_id: project.id,
            filename,
            filepath,
            content: starterContent,
            last_edited_by: user.id
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) {
          newFile.id = data.id;
        }
      }

      // Append locally
      setFiles(prev => [...prev, newFile]);
      setActiveFile(newFile);
      setLocalContent(starterContent);
      setUnsavedChanges(false);

      setActionMessage(`Created ${filepath}`);
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      alert(`Failed to create file: ${err.message || err}`);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!isEditable) return;

    try {
      if (user && project.owner_id !== "owner-stone") {
        const { error } = await supabase
          .from("project_files")
          .delete()
          .eq("id", fileId);

        if (error) throw error;
      }

      // Remove locally
      setFiles(prev => prev.filter(f => f.id !== fileId));
      
      if (activeFile?.id === fileId) {
        const remaining = files.filter(f => f.id !== fileId);
        if (remaining.length > 0) {
          setActiveFile(remaining[0]);
          setLocalContent(remaining[0].content);
        } else {
          setActiveFile(null);
          setLocalContent("");
        }
        setUnsavedChanges(false);
      }

      setActionMessage("File deleted successfully.");
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      alert(`Failed to delete file: ${err.message || err}`);
    }
  };

  const handleRenameFile = async (fileId: string, rawFilepath: string) => {
    if (!isEditable) return;

    const newFilepath = normalizeFilepath(rawFilepath);
    if (!newFilepath) {
      alert("Invalid file path.");
      return;
    }

    // Prevent duplicate filepath collisions
    const fileExists = files.some(f => f.filepath === newFilepath && f.id !== fileId);
    if (fileExists) {
      alert(`A file named "${newFilepath}" already exists in this project.`);
      return;
    }

    try {
      const filename = newFilepath.split("/").pop() || "untitled";

      if (user && project.owner_id !== "owner-stone") {
        const { error } = await supabase
          .from("project_files")
          .update({
            filepath: newFilepath,
            filename,
            last_edited_by: user.id,
            last_edited_at: new Date().toISOString()
          })
          .eq("id", fileId);

        if (error) throw error;
      }

      // Update local state
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, filepath: newFilepath, filename } : f
      ));

      if (activeFile?.id === fileId) {
        setActiveFile(prev => prev ? { ...prev, filepath: newFilepath, filename } : null);
      }

      setActionMessage(`Renamed file to ${filename}`);
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      alert(`Failed to rename file: ${err.message || err}`);
    }
  };

  const handleRenameFolder = async (oldFolderPath: string, rawFolderPath: string) => {
    if (!isEditable) return;

    const newFolderPath = normalizeFilepath(rawFolderPath);
    if (!newFolderPath) {
      alert("Invalid folder path.");
      return;
    }

    // Prevent conflict with existing folder paths
    const folderExists = files.some(f => f.filepath === newFolderPath || f.filepath.startsWith(`${newFolderPath}/`));
    if (folderExists) {
      alert(`A file or folder named "${newFolderPath}" already exists in this project.`);
      return;
    }

    try {
      setSaving(true);
      
      // Get all files matching this folder prefix
      const filesToUpdate = files.filter(f => 
        f.filepath === oldFolderPath || f.filepath.startsWith(`${oldFolderPath}/`)
      );

      if (filesToUpdate.length > 0) {
        if (user && project.owner_id !== "owner-stone") {
          // Perform database updates
          for (const file of filesToUpdate) {
            const newFilepath = file.filepath.replace(oldFolderPath, newFolderPath);
            const filename = newFilepath.split("/").pop() || file.filename;
            
            const { error } = await supabase
              .from("project_files")
              .update({
                filepath: newFilepath,
                filename,
                last_edited_by: user.id,
                last_edited_at: new Date().toISOString()
              })
              .eq("id", file.id);

            if (error) throw error;
          }
        }

        // Update local React state
        setFiles(prev => prev.map(f => {
          if (f.filepath === oldFolderPath || f.filepath.startsWith(`${oldFolderPath}/`)) {
            const newFilepath = f.filepath.replace(oldFolderPath, newFolderPath);
            const filename = newFilepath.split("/").pop() || f.filename;
            return {
              ...f,
              filepath: newFilepath,
              filename
            };
          }
          return f;
        }));

        // Adjust active file reference if it was inside the renamed folder
        if (activeFile && (activeFile.filepath === oldFolderPath || activeFile.filepath.startsWith(`${oldFolderPath}/`))) {
          const newFilepath = activeFile.filepath.replace(oldFolderPath, newFolderPath);
          const filename = newFilepath.split("/").pop() || activeFile.filename;
          setActiveFile(prev => prev ? { ...prev, filepath: newFilepath, filename } : null);
        }

        setActionMessage(`Renamed folder to ${newFolderPath}`);
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      alert(`Failed to rename folder: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFolder = async (rawFolderPath: string) => {
    if (!isEditable) return;

    const folderPath = normalizeFilepath(rawFolderPath);
    if (!folderPath) {
      alert("Invalid folder path.");
      return;
    }

    // Prevent folder conflict checks
    const folderExists = files.some(f => f.filepath === folderPath || f.filepath.startsWith(`${folderPath}/`));
    if (folderExists) {
      alert(`A folder named "${folderPath}" already exists in this project.`);
      return;
    }

    try {
      // Create a .keep placeholder file in the folder so it exists in flat-file DB structure
      const placeholderPath = `${folderPath}/.keep`;
      
      const newId = `file-${Math.random().toString(36).substr(2, 9)}`;
      const newFile: ProjectFile = {
        id: newId,
        filename: ".keep",
        filepath: placeholderPath,
        content: ""
      };

      if (user && project.owner_id !== "owner-stone") {
        const { data, error } = await supabase
          .from("project_files")
          .insert({
            project_id: project.id,
            filename: ".keep",
            filepath: placeholderPath,
            content: "",
            last_edited_by: user.id
          })
          .select("id")
          .single();

        if (error) throw error;
        if (data?.id) {
          newFile.id = data.id;
        }
      }

      // Update local React state
      setFiles(prev => [...prev, newFile]);

      setActionMessage(`Created folder ${folderPath}`);
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      alert(`Failed to create folder: ${err.message || err}`);
    }
  };

  const checkFileEditability = (filepath: string, windowActive: boolean, filesAllowed: string[] | null) => {
    if (!project || !user) return false;
    if (project.owner_id === user.id) return true;
    if (!windowActive) return false;
    if (filesAllowed === null) return true;
    return filesAllowed.includes(filepath);
  };

  const handleRevertFile = async (filepath: string, content: string) => {
    const isOwner = user && project && project.owner_id === user.id;
    if (!isOwner) {
      alert("Only the project owner can revert files.");
      return;
    }

    const fileNode = files.find(f => f.filepath === filepath);
    if (!fileNode) {
      alert(`File "${filepath}" not found in current workspace.`);
      return;
    }

    try {
      setSaving(true);
      
      // Update database content
      if (user && project.owner_id !== "owner-stone") {
        const { error } = await supabase
          .from("project_files")
          .update({
            content: content,
            last_edited_by: user.id,
            last_edited_at: new Date().toISOString()
          })
          .eq("id", fileNode.id);

        if (error) throw error;
      }

      // Update local state
      setFiles(prev => prev.map(f => 
        f.id === fileNode.id ? { ...f, content } : f
      ));

      if (activeFile?.id === fileNode.id) {
        setActiveFile(prev => prev ? { ...prev, content } : null);
        setLocalContent(content);
        setUnsavedChanges(false);
      }

      setActionMessage(`Reverted ${filepath} successfully`);
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      alert(`Reversion failed: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleForkProject = async () => {
    if (!user) {
      alert("Please sign in to fork this project workspace.");
      return;
    }

    try {
      setForking(true);
      setActionMessage("Cloning project assets...");

      // Fetch active JWT token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectId}/fork`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        }
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Forking operation failed.");
      }

      setActionMessage("Workspace successfully cloned! Redirecting...");
      setTimeout(() => {
        router.push(`/project/${resData.newProjectId}`);
      }, 1500);

    } catch (err: any) {
      alert(err.message || "Failed to fork project workspace. Please try again later.");
      setActionMessage(null);
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto md:overflow-hidden bg-bg">
      
      {/* Studio Header Ribbon */}
      <div className="border-b border-border bg-surface px-6 py-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase font-bold bg-transparent border-none p-0 cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </button>
          
          <div className="h-4 w-px bg-border hidden sm:block" />

          <div>
            <h2 className="font-syne text-md font-extrabold text-text-primary flex items-center gap-2">
              <span>{project?.name}</span>
              <span className="text-[10px] text-text-muted uppercase font-mono font-bold select-none">
                [id: {project?.id?.substring(0, 8)}...]
              </span>
            </h2>
            {forkSource && (
              <span className="text-[10px] text-accent/80 uppercase font-mono tracking-wide select-none block mt-0.5 animate-fade-in">
                Forked from{" "}
                <Link
                  href={`/project/${forkSource.id}`}
                  className="underline hover:text-accent font-bold"
                >
                  @{forkSource.ownerUsername}/{forkSource.name}
                </Link>
              </span>
            )}
          </div>

          {secondsLeft !== null && secondsLeft > 0 && (
            <div className="flex items-center gap-1.5 bg-accent2/10 border border-accent2/30 text-accent2 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
              <span className="h-1.5 w-1.5 bg-accent2 rounded-full shrink-0"></span>
              <span>On Air: {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}</span>
            </div>
          )}
        </div>

        {/* Live saving status feedback */}
        <div className="flex items-center gap-4">


          {actionMessage && (
            <span className="text-[10px] text-accent font-semibold uppercase tracking-wider font-mono animate-fade-in bg-accent/5 border border-accent/20 px-2 py-1">
              {actionMessage}
            </span>
          )}

          {user && project && project.owner_id !== user.id && (
            <button
              onClick={handleForkProject}
              disabled={forking}
              className="flex items-center gap-2 px-3 py-1.5 text-xs uppercase font-extrabold tracking-wider bg-accent/10 border border-accent/20 hover:border-accent hover:bg-accent/20 text-accent transition-all cursor-pointer animate-fade-in"
            >
              {forking ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GitFork className="h-3.5 w-3.5" />
              )}
              <span>Fork Studio</span>
            </button>
          )}

          {isEditable && (
            <button
              onClick={handleSaveActiveFile}
              disabled={saving || !activeFile || !unsavedChanges}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs uppercase font-extrabold tracking-wider transition-all cursor-pointer ${
                unsavedChanges 
                  ? "bg-accent text-bg hover:bg-accent2" 
                  : "bg-surface border border-border text-text-dim cursor-not-allowed"
              }`}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>Commit ({typeof window !== "undefined" && window.navigator.platform.indexOf("Mac") > -1 ? "⌘S" : "Ctrl+S"})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Three Pane Workspace Grid */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch overflow-y-auto md:overflow-hidden min-h-0 relative">
        
        {/* Pane 1: File Tree Sidebar (Left) */}
        {explorerState === "collapsed" ? (
          <div
            onClick={() => handleCollapsePane("explorer", false)}
            className="w-full md:w-12 border-b md:border-b-0 md:border-r border-border bg-bg hover:bg-surface p-3 flex md:flex-col items-center justify-between cursor-pointer transition-all duration-200 group select-none shrink-0 animate-fade-in"
            title="Click to restore Explorer"
          >
            <div className="flex md:flex-col items-center gap-4">
              <button 
                type="button"
                className="p-1 bg-transparent border-none text-text-muted group-hover:text-accent transition-colors cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              
              <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold md:[writing-mode:vertical-lr] md:rotate-180 select-none">
                Explorer Collapsed
              </span>
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-1.5 mt-auto">
              <FolderIcon className="h-4 w-4 text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </div>
        ) : (
          <div className={`w-full border-b md:border-b-0 md:border-r border-border bg-bg p-4 shrink-0 overflow-y-auto h-auto md:h-full flex flex-col transition-all duration-200 ${
            explorerState === "maximized" 
              ? "flex-1 w-full h-full" 
              : "md:w-60"
          } ${
            editorState === "maximized" || previewState === "maximized" ? "hidden" : ""
          }`}>
            {/* Header with Collapse and Maximize Buttons */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border shrink-0 select-none">
              <span className="font-syne text-[10px] uppercase tracking-wider font-extrabold text-text-muted">
                {sidebarTab === "explorer" ? "Workspace Explorer" : "Admin Panel"}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollapsePane("explorer", true);
                  }}
                  title="Collapse Sidebar"
                  className="p-0.5 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaximizePane("explorer");
                  }}
                  title={explorerState === "maximized" ? "Restore Sidebar" : "Maximize Sidebar"}
                  className="p-0.5 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Phase 3 Tab Selector for Owner controls */}
            {user && project && project.owner_id === user.id && (
              <div className="flex gap-2 mb-4 border-b border-border text-[10px] uppercase font-bold shrink-0">
                <button 
                  onClick={() => setSidebarTab("explorer")}
                  className={`flex-1 pb-2 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-all ${sidebarTab === "explorer" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-primary"}`}
                >
                  <FolderIcon className="h-3.5 w-3.5" /> Explorer
                </button>
                <button 
                  onClick={() => setSidebarTab("admin")}
                  className={`flex-1 pb-2 flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-all ${sidebarTab === "admin" ? "border-accent text-accent" : "border-transparent text-text-muted hover:text-text-primary"}`}
                >
                  <Settings className="h-3.5 w-3.5" /> Admin Panel
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0">
              {sidebarTab === "explorer" ? (
                <FileTree
                  files={files}
                  activeFileId={activeFile?.id || null}
                  onSelectFile={handleSelectFile}
                  onCreateFile={handleCreateNewFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  onRenameFolder={handleRenameFolder}
                  onCreateFolder={handleCreateFolder}
                  isEditable={isEditable}
                />
              ) : (
                <AdminPanel
                  projectId={projectId}
                  currentUser={user}
                  files={files}
                  onRevertFile={handleRevertFile}
                />
              )}
            </div>
          </div>
        )}

        {/* Pane 2: Monaco Editor Workspace (Center) */}
        {editorState === "minimized" ? (
          <div 
            onClick={() => setEditorState("normal")}
            className="w-full md:w-12 border-b md:border-b-0 md:border-r border-border bg-bg hover:bg-surface p-3 flex md:flex-col items-center justify-between cursor-pointer transition-all duration-200 group select-none shrink-0"
            title="Click to restore Editor"
          >
            <div className="flex md:flex-col items-center gap-4">
              <button 
                type="button"
                className="p-1 bg-transparent border-none text-text-muted group-hover:text-accent transition-colors cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              
              <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold md:[writing-mode:vertical-lr] md:rotate-180 select-none">
                Editor Collapsed
              </span>
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-1.5 mt-auto">
              <FileCode className="h-4 w-4 text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col min-w-0 bg-surface2 h-[500px] md:h-full relative ${editorState === "maximized" ? "z-10" : ""}`}>
            {/* Phase 3 Monaco Gating Warning Ribbon */}
            {!isEditable && activeFile && (
              <div className="bg-[#ff6b35]/10 border-b border-[#ff6b35]/30 px-4 py-2 flex items-center gap-2 select-none text-[10px] text-accent2 font-mono shrink-0 uppercase tracking-wider font-extrabold animate-fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0 text-accent2 animate-pulse" />
                <span>Workspace write-locked (requires active edit slot / allowed file permission)</span>
              </div>
            )}

            {activeFile ? (
              <MonacoWrap
                content={localContent}
                filepath={activeFile.filepath}
                onChange={handleEditorChange}
                onSave={handleSaveActiveFile}
                isReadOnly={!isEditable}
                editorState={editorState}
                onChangeEditorState={setEditorState}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-dim">
                <FileCode className="h-10 w-10 text-text-dim mb-3 animate-pulse" />
                <p className="text-xs uppercase tracking-wider">No File Active</p>
                <p className="text-[10px] max-w-xs mt-1">Select a file from the sidebar explorer or click the add button to begin coding.</p>
              </div>
            )}
          </div>
        )}
        {/* Pane 3: Companion Panel (Right) - Toggle between Live Preview and Real-Time Chat */}
        {previewState === "collapsed" ? (
          <div
            onClick={() => handleCollapsePane("preview", false)}
            className="w-full md:w-12 border-t md:border-t-0 md:border-l border-border bg-bg hover:bg-surface p-3 flex md:flex-col items-center justify-between cursor-pointer transition-all duration-200 group select-none shrink-0 animate-fade-in"
            title="Click to restore Companion Panel"
          >
            <div className="flex md:flex-col items-center gap-4">
              <button 
                type="button"
                className="p-1 bg-transparent border-none text-text-muted group-hover:text-accent transition-colors cursor-pointer"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              
              <span className="font-mono text-[9px] uppercase tracking-widest text-text-muted font-bold md:[writing-mode:vertical-lr] md:rotate-180 select-none">
                Preview Collapsed
              </span>
            </div>
            
            <div className="hidden md:flex flex-col items-center gap-1.5 mt-auto">
              <Terminal className="h-4 w-4 text-text-dim group-hover:text-accent transition-colors" />
            </div>
          </div>
        ) : (
          <div className={`shrink-0 overflow-hidden bg-bg border-l border-border flex flex-col transition-all duration-200 ${
            previewState === "maximized" 
              ? "flex-1 w-full h-full" 
              : editorState === "minimized" 
                ? "flex-1 w-full h-full" 
                : "w-full md:w-[380px] lg:w-[480px] h-[450px] md:h-full"
          } ${
            explorerState === "maximized" || editorState === "maximized" ? "hidden" : ""
          }`}>
            {/* Tab Selector Header with Sizing Controls */}
            <div className="flex items-center justify-between bg-surface border-b border-border shrink-0 select-none">
              <div className="flex flex-1 text-[10px] uppercase font-bold">
                <button
                  onClick={() => setActiveRightTab("preview")}
                  className={`flex-1 py-3 flex items-center justify-center gap-1.5 cursor-pointer transition-all border-b-2 ${
                    activeRightTab === "preview" 
                      ? "border-accent text-accent bg-bg/20" 
                      : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg/10"
                  }`}
                >
                  <span>Live Preview</span>
                </button>
                <button
                  onClick={() => {
                    setActiveRightTab("chat");
                    setUnreadMessages(0);
                  }}
                  className={`flex-1 py-3 flex items-center justify-center gap-2 cursor-pointer transition-all border-b-2 relative ${
                    activeRightTab === "chat" 
                      ? "border-accent text-accent bg-bg/20" 
                      : "border-transparent text-text-muted hover:text-text-primary hover:bg-bg/10"
                  }`}
                >
                  <span>Studio Chat</span>
                  {unreadMessages > 0 && (
                    <span className="bg-accent2 text-bg text-[8px] font-mono px-1.5 py-0.5 rounded-full shrink-0 font-extrabold animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 border-l border-border h-full align-middle">
                {/* Collapse Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCollapsePane("preview", true);
                  }}
                  title="Collapse Panel"
                  className="p-0.5 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <Minimize2 className="h-3.5 w-3.5" />
                </button>
                
                {/* Maximize Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMaximizePane("preview");
                  }}
                  title={previewState === "maximized" ? "Restore Panel" : "Maximize Panel"}
                  className="p-0.5 hover:text-accent text-text-muted transition-colors bg-transparent border-none cursor-pointer flex items-center"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tab Content Panels */}
            <div className="flex-1 min-h-0 relative flex flex-col">
              {activeRightTab === "preview" ? (
                <PreviewPane files={files} />
              ) : (
                <div className="flex-1 flex flex-col min-h-0 bg-surface2 p-4 font-sans border-l border-border">
                  {/* Chat Message Viewport */}
                  <div className="flex-1 overflow-y-auto min-h-0 space-y-3 mb-4 pr-1 select-text scrollbar-thin">
                    {chatMessages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-text-dim">
                        <Terminal className="h-8 w-8 text-text-muted mb-2 animate-pulse" />
                        <p className="text-[10px] uppercase tracking-wider">No transmission active</p>
                        <p className="text-[9px] max-w-xs mt-1">Send a message to sync with the workspace team in real-time.</p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isSystem = msg.userId === "system";
                        const isSelf = msg.userId === user?.id;
                        
                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center select-none">
                              <span className="text-[9px] uppercase tracking-wider font-mono font-semibold text-text-dim bg-surface px-2 py-0.5 border border-border">
                                {msg.text}
                              </span>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col max-w-[85%] ${isSelf ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5 select-none">
                              <span className="text-[10px] font-bold text-text-primary">
                                {msg.username}
                              </span>
                              
                              {/* Role Badge */}
                              {msg.role === "owner" && (
                                <span className="text-[8px] uppercase tracking-wider px-1 bg-accent/10 border border-accent/30 text-accent font-extrabold rounded font-syne select-none">
                                  Owner
                                </span>
                              )}
                              {msg.role === "contributor" && (
                                <span className="text-[8px] uppercase tracking-wider px-1 bg-accent2/10 border border-accent2/30 text-accent2 font-extrabold rounded font-syne select-none">
                                  Contrib
                                </span>
                              )}
                            </div>

                            <div className={`px-3 py-2 text-xs break-all border ${
                              isSelf 
                                ? "bg-accent/10 border-accent/30 text-text-primary rounded-l-lg rounded-tr-lg" 
                                : "bg-surface border-border text-text-primary rounded-r-lg rounded-tl-lg"
                            }`}>
                              {msg.text}
                            </div>
                            
                            <span className="text-[8px] text-text-muted mt-0.5 font-mono select-none">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        );
                      })
                    )}
                    {/* Anchor to auto-scroll */}
                    <div id="chat-anchor" />
                  </div>

                  {/* Quick Interaction Chips */}
                  <div className="flex gap-1.5 overflow-x-auto pb-2 pr-1 mb-2 select-none scrollbar-none">
                    {["LGTM! 🔥", "Ready to commit", "Need help here", "Checking preview", "Check code structure"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (!socket || !project || !user) return;
                          const userRole = project.owner_id === user.id ? "owner" : (allowedFiles !== null || secondsLeft !== null ? "contributor" : "guest");
                          socket.emit("send_message", {
                            projectId: project.id,
                            userId: user.id,
                            username: profileUsername || user.email?.split("@")[0] || "Developer",
                            avatarUrl: profileAvatarUrl || "",
                            text: chip,
                            role: userRole
                          });
                        }}
                        className="px-2.5 py-1 bg-surface border border-border text-[9px] uppercase tracking-wider font-semibold text-text-dim hover:text-accent hover:border-accent/40 rounded transition-all shrink-0 cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0 border-t border-border pt-3 select-none">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Transmit code signals..."
                      className="flex-1 bg-surface border border-border px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-accent text-bg hover:bg-accent2 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Send
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Premium Micro-Animated Floating Countdown Overlay HUD */}
      {secondsLeft !== null && secondsLeft > 0 && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 transform ${
          secondsLeft < 300 ? "animate-pulse scale-105" : "hover:scale-105"
        }`}>
          <div className={`glass-panel p-4 flex items-center gap-4 shadow-2xl border-l-4 ${
            secondsLeft < 300 ? "border-accent2 border-l-accent2" : "border-accent border-l-accent"
          }`}>
            {/* SVG Dynamic Circular Timer Ring */}
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="transparent"
                  stroke="#2a2a2a"
                  strokeWidth="2.5"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="transparent"
                  stroke={secondsLeft < 300 ? "#ff6b35" : "#cbd637"}
                  strokeWidth="3"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (Math.min(100, Math.max(0, (secondsLeft / (totalSeconds || secondsLeft)) * 100)) / 100) * 125.6}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              {/* Ping center indicator */}
              <span className={`w-2 h-2 rounded-full ${
                secondsLeft < 300 ? "bg-accent2 animate-ping" : "bg-accent"
              }`}></span>
            </div>

            {/* Time Texts */}
            <div className="font-mono">
              <span className="block text-[8px] uppercase tracking-widest text-text-muted font-bold select-none">
                {secondsLeft < 300 ? "LOCKOUT CRITICAL" : "SESSION ACTIVE"}
              </span>
              <span className={`block text-xl font-black font-mono tracking-wider ${
                secondsLeft < 300 ? "text-accent2" : "text-text-primary"
              }`}>
                {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, "0")}
              </span>
              <span className="block text-[9px] text-text-muted mt-0.5">
                Allowed Scope: {allowedFiles?.join(", ") || "All files"}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
