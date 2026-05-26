"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Code, Calendar, AlertTriangle, Trash2, Save, LogOut, Loader2, ArrowLeft, Plus, X, Upload, FolderOpen
} from "lucide-react";
import Link from "next/link";

interface Profile {
  username: string;
  avatar_url: string;
  stack_tags: string[];
  created_at: string;
}

interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  stack_tags: string[];
  role: "owner" | "contributor";
}

export default function ProfilePage() {
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          setAvatarUrl(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeWorkspaces, setActiveWorkspaces] = useState<ProjectSummary[]>([]);
  const [pastWorkspaces, setPastWorkspaces] = useState<ProjectSummary[]>([]);

  // Form states
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [stackTags, setStackTags] = useState<string[]>([]);
  
  // Interface alert states
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteLogs, setDeleteLogs] = useState<string[]>([]);

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, stack_tags, created_at")
        .eq("id", userId)
        .single();
      
      if (data && !error) {
        setProfile(data);
        setUsername(data.username);
        setAvatarUrl(data.avatar_url || "");
        setStackTags(data.stack_tags || []);
      }
    } catch (e) {
      // Fail silently without leaking database error traces to browser console
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkspaces = async (userId: string) => {
    try {
      const [{ data: ownedProjects }, { data: contributorProjects }] = await Promise.all([
        supabase
          .from("projects")
          .select("id, name, description, stack_tags")
          .eq("owner_id", userId),
        supabase
          .from("contributors")
          .select(`
            status,
            project:project_id (
              id,
              name,
              description,
              stack_tags
            )
          `)
          .eq("user_id", userId)
      ]);

      const active: ProjectSummary[] = [];
      const past: ProjectSummary[] = [];

      if (ownedProjects) {
        active.push(
          ...ownedProjects.map((project) => ({
            ...project,
            role: "owner" as const
          }))
        );
      }

      if (contributorProjects) {
        contributorProjects.forEach((entry: any) => {
          if (!entry.project) return;
          const summary: ProjectSummary = {
            id: entry.project.id,
            name: entry.project.name,
            description: entry.project.description,
            stack_tags: entry.project.stack_tags || [],
            role: "contributor"
          };
          if (entry.status === "active") {
            active.push(summary);
          } else {
            past.push(summary);
          }
        });
      }

      const dedupe = (items: ProjectSummary[]) => {
        const map = new Map<string, ProjectSummary>();
        items.forEach((item) => {
          if (!map.has(item.id)) {
            map.set(item.id, item);
          }
        });
        return Array.from(map.values());
      };

      setActiveWorkspaces(dedupe(active));
      setPastWorkspaces(dedupe(past));
    } catch (e) {
      // Fail silently without leaking database error traces to browser console
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      setUser(session.user);
      fetchProfileData(session.user.id);
      fetchUserWorkspaces(session.user.id);
    });
  }, []);

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim() && !stackTags.includes(tagInput.trim())) {
      setStackTags([...stackTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setStackTags(stackTags.filter((_, i) => i !== index));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setStatusMsg({ type: "error", text: "Username cannot be empty." });
      return;
    }

    setUpdating(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          avatar_url: avatarUrl.trim(),
          stack_tags: stackTags
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, username: username.trim(), avatar_url: avatarUrl.trim(), stack_tags: stackTags } : null);

      setStatusMsg({ type: "success", text: "Developer card updated successfully!" });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ 
        type: "error", 
        text: "Unable to update your developer profile. The username might already be in use. Please try again." 
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteLogs([]);
    
    const simulatedDeleteLogs = [
      `[INIT] Cascade account purge sequence initiated...`,
      `[RESOLV] Locating user profile reference for @${username || "developer"}...`,
      `[WIPE] Purging developer database profile card mappings...`,
      `[WIPE] Cascade-scrubbing allow_files and workspace records...`,
      `[WIPE] Revoking Socket.io Timed Edit session locks...`,
      `[WIPE] Wiping authenticated session cookies and credentials...`,
      `[CONN] Dispatching remote backend purge transaction...`
    ];

    try {
      // Sequentially print logs with timeouts for immersive terminal sensation
      for (let i = 0; i < simulatedDeleteLogs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 450));
        setDeleteLogs(prev => [...prev, simulatedDeleteLogs[i]]);
      }

      // 1. Fetch the active JWT token via supabase.auth.getSession()
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 2. Fire Express admin delete endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-account`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token || ""}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend account deletion failed.");
      }

      // Success log print
      await new Promise(resolve => setTimeout(resolve, 300));
      setDeleteLogs(prev => [...prev, `[SUCCESS] Cascade wipe complete. Session terminated. Redirecting...`]);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Sign out of Supabase client session
      await supabase.auth.signOut();
      
      // 3. Close modal & redirect
      setShowDeleteModal(false);
      router.push("/");
      window.location.reload();
      
    } catch (err: any) {
      setStatusMsg({ 
        type: "error", 
        text: "We encountered a problem deleting your account. Please contact support or try again later." 
      });
      setDeletingAccount(false);
      setDeleteLogs([]);
      setShowDeleteModal(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg px-6 py-12 relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation back and header */}
        <div className="mb-10">
          <button 
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider font-semibold mb-4 cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to marketplace</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
                Developer <span className="text-accent">Card</span>
              </h1>
              <p className="text-xs text-text-muted">
                Configure your public stranger collaboration identity and manage account access settings.
              </p>
            </div>
            
            <button
              onClick={handleSignOut}
              className="sm:self-start border border-border hover:border-accent2 hover:text-accent2 px-4 py-2.5 transition-all text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>

        {statusMsg && (
          <div className={`p-4 border mb-8 text-xs ${
            statusMsg.type === "success" 
              ? "bg-note-bg border-note-border text-accent" 
              : "bg-warning-bg border-warning-border text-accent2"
          }`}>
            <p className="font-semibold uppercase tracking-wider mb-1">System Feedback</p>
            <p>{statusMsg.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Avatar Panel */}
          <div className="glass-panel p-6 border border-border text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <img 
                src={avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                alt={username} 
                className="h-28 w-28 border border-border bg-surface2 p-1.5 rounded-none shadow-lg shadow-black"
              />
              <div className="absolute -bottom-1 -right-1 bg-accent text-bg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                Active
              </div>
            </div>

            <div>
              <h3 className="font-syne text-lg font-bold tracking-tight text-text-primary">
                @{username || "developer"}
              </h3>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">
                Leenout Strangers Network
              </p>
            </div>

            <div className="border-t border-border pt-4 text-left space-y-3.5 text-xs text-text-muted">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-accent" />
                <span className="truncate">{user?.email || "No email linked"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-accent" />
                <span>Joined {profile ? new Date(profile.created_at).toLocaleDateString() : "recently"}</span>
              </div>
            </div>
          </div>

          {/* Right Inputs/Form Area */}
          <div className="md:col-span-2 space-y-8">
            
            {/* Identity Card form */}
            <form onSubmit={handleSaveProfile} className="glass-panel p-8 border border-border space-y-6">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wider text-accent border-b border-border pb-3 mb-2 flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Public Identity Profile</span>
              </h2>

              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                  Developer Username *
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  required
                  className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all font-mono"
                  placeholder="username"
                />
              </div>

              {/* Avatar URL & Seed Picker Input */}
              <div>
                <label htmlFor="avatarUrl" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold flex items-center justify-between gap-4">
                  <span>Custom Avatar Image / SVG URL</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = Math.random().toString(36).substring(7);
                        setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
                      }}
                      className="text-[9px] border border-border hover:border-accent bg-surface hover:text-accent px-2 py-0.5 font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Randomize Bot
                    </button>
                    
                    <input
                      type="file"
                      id="avatar-upload-settings"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload-settings"
                      className="text-[9px] border border-border hover:border-accent2 bg-surface hover:text-accent2 px-2 py-0.5 font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Upload className="h-2.5 w-2.5" />
                      <span>Upload Local</span>
                    </label>
                  </div>
                </label>
                <input
                  type="text"
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all font-mono"
                  placeholder="https://example.com/avatar.png"
                />
              </div>

              {/* Dynamic Tech Stack Tags */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                  My Core Languages / Stack Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Next.js, Rust, Tailwind"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 bg-surface border border-border text-text-primary px-4 py-2.5 text-xs focus:border-accent focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-surface hover:bg-surface2 text-accent border border-border hover:border-accent px-4 py-2 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {stackTags.map((tag, idx) => (
                    <span key={idx} className="bg-surface2 border border-border text-text-primary text-[10px] pl-2.5 pr-1 py-1 flex items-center gap-1.5 font-mono">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="text-text-muted hover:text-accent2 transition-colors cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  {stackTags.length === 0 && (
                    <span className="text-xs text-text-dim italic">No stack tags configured. Add tags to attract relevant stranger pairings.</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 bg-text-primary hover:bg-accent text-bg hover:text-bg font-extrabold text-xs uppercase tracking-widest py-3.5 px-6 transition-all duration-300 cursor-pointer disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Synchronizing changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    <span>Save Card Configuration</span>
                  </>
                )}
              </button>
            </form>

            {/* Danger Zone */}
            <div className="glass-panel p-8 border border-accent2/30 bg-accent2/5 space-y-6">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wider text-accent2 border-b border-accent2/25 pb-3 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Danger Zone</span>
              </h2>

              <p className="text-xs text-text-primary/90 leading-relaxed">
                Deleting your developer account will permanently wipe your profile, hosted project cards, access requests history, and all contributor connections from Leenout servers. This action is irreversible.
              </p>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full sm:w-auto bg-accent2/10 hover:bg-accent2 border border-accent2/40 text-accent2 hover:text-bg font-extrabold text-xs uppercase tracking-widest py-3 px-6 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="h-4.5 w-4.5" />
                <span>Delete Developer Account</span>
              </button>
            </div>

            {/* Active Workspaces */}
            <div className="glass-panel p-8 border border-border space-y-6">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wider text-accent border-b border-border pb-3 mb-2 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Active Workspaces</span>
              </h2>

              {activeWorkspaces.length === 0 ? (
                <p className="text-xs text-text-dim italic">No active workspaces yet.</p>
              ) : (
                <div className="space-y-3">
                  {activeWorkspaces.map((project) => (
                    <div key={project.id} className="bg-surface border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{project.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-text-muted border border-border px-2 py-0.5">
                          {project.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted line-clamp-2">{project.description}</p>
                      {project.stack_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.stack_tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[9px] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Workspaces */}
            <div className="glass-panel p-8 border border-border space-y-6">
              <h2 className="font-syne text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border pb-3 mb-2 flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                <span>Past Workspaces</span>
              </h2>

              {pastWorkspaces.length === 0 ? (
                <p className="text-xs text-text-dim italic">No past workspaces recorded.</p>
              ) : (
                <div className="space-y-3">
                  {pastWorkspaces.map((project) => (
                    <div key={project.id} className="bg-surface border border-border/50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-primary">{project.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-text-dim border border-border px-2 py-0.5">
                          {project.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted line-clamp-2">{project.description}</p>
                      {project.stack_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {project.stack_tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[9px] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-bg/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          {deletingAccount ? (
            /* Premium Terminal Cascading Logs Purge Overlay */
            <div className="w-full max-w-lg glass-panel p-6 border border-accent2/60 bg-surface shadow-2xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent2 animate-ping shrink-0"></div>
                  <span className="text-[10px] uppercase tracking-widest text-accent2 font-bold font-syne">TERMINAL SECURE CASCADE PURGE v1.0</span>
                </div>
                <span className="text-[9px] text-text-muted animate-pulse">STATUS: EXECUTING</span>
              </div>

              {/* Console Logs Box */}
              <div className="bg-bg border border-border p-4 h-64 overflow-y-auto text-[11px] font-mono leading-relaxed space-y-1.5 scrollbar-thin scrollbar-thumb-border">
                {deleteLogs.map((log, index) => {
                  let logColor = "text-text-primary";
                  if (log.startsWith("[INIT]") || log.startsWith("[RESOLV]")) logColor = "text-text-muted";
                  if (log.startsWith("[WIPE]")) logColor = "text-accent2";
                  if (log.startsWith("[CONN]")) logColor = "text-accent";
                  if (log.startsWith("[SUCCESS]")) logColor = "text-emerald-400 font-bold";
                  return (
                    <div key={index} className={`${logColor} animate-fade-in`}>
                      {log}
                    </div>
                  );
                })}
                <div className="text-text-dim animate-pulse">// console sequence tracking active...</div>
              </div>

              <div className="text-[9px] text-text-muted text-center italic">
                Sovereign Data Protection: Cascade wipes execute across PostgreSQL partitions in real-time.
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md glass-panel p-6 border border-accent2/40 relative z-10 shadow-2xl space-y-6 bg-surface">
              
              <div className="text-center space-y-3">
                <div className="inline-flex p-3.5 bg-accent2/10 border border-accent2/35 text-accent2 rounded-none mb-2">
                  <AlertTriangle className="h-8 w-8 animate-bounce" />
                </div>
                <h3 className="font-syne text-xl font-bold tracking-tight text-text-primary">
                  Are you absolutely sure?
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  This deletes your login account <span className="text-accent">@{username}</span> and all associated project workspaces permanently from PostgreSQL. There is no backup undo.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingAccount}
                  className="flex-1 border border-border hover:border-text-primary text-text-muted hover:text-text-primary py-3 text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 bg-accent2 text-bg hover:bg-accent2/90 font-bold py-3 text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Wiping...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Wipe Account</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
