"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { 
  Check, X, UserMinus, Calendar, History, ShieldAlert, Clock, FileText, UserCheck, Trash2, ShieldCheck, Loader2,
  Eye, Settings, GitBranch, Github, Bell
} from "lucide-react";
import { ProjectFile } from "./file-tree";
import MonacoDiff from "./monaco-diff";

interface Contributor {
  id: string;
  user_id: string;
  allowed_files: string[] | null;
  status: "active" | "kicked";
  joined_at: string;
  profile?: {
    username: string;
    avatar_url: string;
  };
}

interface AccessRequest {
  id: string;
  project_id: string;
  requester_id: string;
  message: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string;
  };
}

interface EditWindow {
  id: string;
  contributor_id: string;
  start_time: string;
  end_time: string;
  status: "scheduled" | "active" | "completed";
  created_at: string;
  profile?: {
    username: string;
  };
}

interface EditSession {
  id: string;
  file_id: string;
  editor_id: string;
  content_snapshot: string;
  created_at: string;
  filepath: string;
  profile?: {
    username: string;
  };
}

interface AdminPanelProps {
  projectId: string;
  currentUser: any;
  files: ProjectFile[];
  onRevertFile: (filepath: string, content: string) => Promise<void>;
}

type TabType = "requests" | "contributors" | "schedule" | "history" | "settings";

export default function AdminPanel({ projectId, currentUser, files, onRevertFile }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("requests");
  
  // Data States
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [windows, setWindows] = useState<EditWindow[]>([]);
  const [sessions, setSessions] = useState<EditSession[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  // Form States
  const [scheduleUser, setScheduleUser] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Premium Features States
  const [diffSession, setDiffSession] = useState<EditSession | null>(null);
  
  // Webhooks
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookType, setWebhookType] = useState<"discord" | "slack">("discord");
  
  // GitHub Sync
  const [githubToken, setGithubToken] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubCommitMessage, setGithubCommitMessage] = useState("Sync project workspace");
  const [isSyncing, setIsSyncing] = useState(false);

  // Load configured settings from localStorage
  useEffect(() => {
    if (projectId) {
      const savedWebhook = localStorage.getItem(`webhookUrl:${projectId}`);
      const savedType = localStorage.getItem(`webhookType:${projectId}`);
      const savedRepo = localStorage.getItem(`githubRepo:${projectId}`);
      
      if (savedWebhook) setWebhookUrl(savedWebhook);
      if (savedType) setWebhookType(savedType as "discord" | "slack");
      if (savedRepo) setGithubRepo(savedRepo);
    }
  }, [projectId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectId}/webhook-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          webhookUrl,
          webhookType
        })
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || `HTTP ${res.status}`);
      }

      localStorage.setItem(`webhookUrl:${projectId}`, webhookUrl);
      localStorage.setItem(`webhookType:${projectId}`, webhookType);
      localStorage.setItem(`githubRepo:${projectId}`, githubRepo);
      showToast("Settings saved successfully and synced with server!");
    } catch (err: any) {
      alert(`Failed to save settings on server: ${err.message}`);
    }
  };

  const handleGitHubSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubToken || !githubRepo || !githubCommitMessage) {
      alert("Missing required synchronization inputs.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectId}/github-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          githubToken,
          repoName: githubRepo,
          commitMessage: githubCommitMessage,
          branch: githubBranch
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || `HTTP ${res.status}`);
      }

      showToast(`GitHub Sync Complete! Synced ${result.syncedFiles.length} files.`);
      // Clear token and persist repo
      localStorage.setItem(`githubRepo:${projectId}`, githubRepo);
      setGithubCommitMessage("Sync project workspace");
    } catch (err: any) {
      alert(`GitHub sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch all admin data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Access Requests with Profiles (explicit requester_id join)
      const { data: reqData, error: reqError } = await supabase
        .from("access_requests")
        .select(`
          *,
          profile:profiles!requester_id(username, avatar_url)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (!reqError) setRequests(reqData || []);

      // 2. Fetch Contributors with Profiles (explicit user_id join)
      const { data: contribData, error: contribError } = await supabase
        .from("contributors")
        .select(`
          *,
          profile:profiles!user_id(username, avatar_url)
        `)
        .eq("project_id", projectId)
        .eq("status", "active")
        .order("joined_at", { ascending: false });

      if (!contribError) setContributors(contribData || []);

      // 3. Fetch Edit Windows with Profiles (explicit contributor_id join)
      const { data: winData, error: winError } = await supabase
        .from("edit_windows")
        .select(`
          *,
          profile:profiles!contributor_id(username)
        `)
        .eq("project_id", projectId)
        .order("start_time", { ascending: false });

      if (!winError) setWindows(winData || []);

      // 4. Fetch Edit Sessions (History snapshots) with Profiles and Filepaths (explicit joins)
      const { data: sessData, error: sessError } = await supabase
        .from("edit_sessions")
        .select(`
          *,
          profile:profiles!editor_id(username),
          project_file:project_files!file_id(filepath)
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (!sessError) {
        // Map files filepath to snapshots
        const mappedSessions = (sessData || []).map((s: any) => ({
          ...s,
          filepath: s.project_file?.filepath || "Deleted File"
        }));
        setSessions(mappedSessions);
      }

    } catch (e) {
      // Fail silently in browser
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  const showToast = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // --- ACCESS REQUEST HANDLERS ---
  const handleResolveRequest = async (requestId: string, requesterId: string, approve: boolean) => {
    try {
      if (approve) {
        // 1. Check if contributor entry already exists (e.g. they were kicked/left before)
        const { data: existing } = await supabase
          .from("contributors")
          .select("id")
          .eq("project_id", projectId)
          .eq("user_id", requesterId)
          .single();

        if (existing) {
          // Reactivate contributor
          const { error: updateError } = await supabase
            .from("contributors")
            .update({ status: "active", joined_at: new Date().toISOString() })
            .eq("id", existing.id);
          if (updateError) throw updateError;
        } else {
          // Insert new contributor
          const { error: insertError } = await supabase
            .from("contributors")
            .insert({
              project_id: projectId,
              user_id: requesterId,
              status: "active",
              allowed_files: null
            });
          if (insertError) throw insertError;
        }

        // 2. Update Access Request
        const { error: reqError } = await supabase
          .from("access_requests")
          .update({ status: "approved", resolved_at: new Date().toISOString() })
          .eq("id", requestId);
        if (reqError) throw reqError;

        showToast("Approved contributor access!");
      } else {
        // Deny Request
        const { error: reqError } = await supabase
          .from("access_requests")
          .update({ status: "denied", resolved_at: new Date().toISOString() })
          .eq("id", requestId);
        if (reqError) throw reqError;

        showToast("Denied access request.");
      }
      
      // Reload Data
      fetchData();
    } catch (err: any) {
      alert(`Error resolving request: ${err.message || err}`);
    }
  };

  // --- CONTRIBUTOR MANAGEMENT HANDLERS ---
  const handleToggleFilePermission = async (contribId: string, filepath: string, isAllowed: boolean, currentAllowed: string[] | null) => {
    try {
      let nextAllowed: string[] | null = null;
      if (isAllowed) {
        // Adding permission
        nextAllowed = currentAllowed ? [...currentAllowed, filepath] : [filepath];
      } else {
        // Removing permission
        nextAllowed = currentAllowed ? currentAllowed.filter(f => f !== filepath) : [];
        if (nextAllowed.length === 0) {
          nextAllowed = []; // empty array means locked out, null means full access
        }
      }

      // Check if they have unchecked all files, toggle to full access or locked
      // To keep it flexible: if the owner deletes everything, they get null (full access) or custom
      // Let's allow saving empty array (meaning strict lockout of files)
      const { error } = await supabase
        .from("contributors")
        .update({ allowed_files: nextAllowed })
        .eq("id", contribId);

      if (error) throw error;

      showToast("Updated file permissions!");
      setContributors(prev => prev.map(c => 
        c.id === contribId ? { ...c, allowed_files: nextAllowed } : c
      ));
    } catch (err: any) {
      alert(`Error updating file permission: ${err.message || err}`);
    }
  };

  const handleGrantFullAccess = async (contribId: string) => {
    try {
      const { error } = await supabase
        .from("contributors")
        .update({ allowed_files: null })
        .eq("id", contribId);

      if (error) throw error;
      showToast("Granted unrestricted full access.");
      setContributors(prev => prev.map(c => 
        c.id === contribId ? { ...c, allowed_files: null } : c
      ));
    } catch (err: any) {
      alert(`Error granting access: ${err.message || err}`);
    }
  };

  const handleKickContributor = async (contrib: Contributor) => {
    const reason = prompt(`Enter kick reason for "${contrib.profile?.username || "Contributor"}":`);
    if (reason === null) return; // cancelled

    try {
      const cooldownDays = 7;
      const cooldownUntil = new Date();
      cooldownUntil.setDate(cooldownUntil.getDate() + cooldownDays);

      // 1. Insert into Kicks with cooldown
      const { error: kickError } = await supabase
        .from("kicks")
        .insert({
          project_id: projectId,
          kicked_user_id: contrib.user_id,
          kicked_by: currentUser.id,
          reason: reason || "Kicked by owner.",
          cooldown_until: cooldownUntil.toISOString()
        });

      if (kickError) throw kickError;

      // 2. Invalidate their contributor status
      const { error: contribError } = await supabase
        .from("contributors")
        .update({ status: "kicked", kicked_at: new Date().toISOString() })
        .eq("id", contrib.id);

      if (contribError) throw contribError;

      // 3. Clear their access request so they can re-submit after cooldown is over
      const { error: deleteReqError } = await supabase
        .from("access_requests")
        .delete()
        .eq("project_id", projectId)
        .eq("requester_id", contrib.user_id);

      if (deleteReqError) {
        console.warn("Could not delete request, but proceeding:", deleteReqError);
      }

      // 4. Invalidate their active edit windows
      const { error: winError } = await supabase
        .from("edit_windows")
        .delete()
        .eq("project_id", projectId)
        .eq("contributor_id", contrib.user_id)
        .eq("status", "scheduled");

      if (winError) {
        console.warn("Could not clear upcoming windows:", winError);
      }

      showToast(`Kicked ${contrib.profile?.username} (7-day cooldown applied)`);
      fetchData();
    } catch (err: any) {
      alert(`Error kicking contributor: ${err.message || err}`);
    }
  };

  // --- EDIT WINDOW SCHEDULER HANDLERS ---
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleUser || !scheduleStart || !scheduleEnd) return;

    const start = new Date(scheduleStart);
    const end = new Date(scheduleEnd);

    if (start >= end) {
      alert("Start time must be before the end time!");
      return;
    }

    setSubmittingSchedule(true);
    try {
      const now = new Date();
      let status: "scheduled" | "active" = "scheduled";
      if (now >= start && now <= end) {
        status = "active";
      }

      const { error } = await supabase
        .from("edit_windows")
        .insert({
          project_id: projectId,
          contributor_id: scheduleUser,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status
        });

      if (error) throw error;

      showToast("Edit window scheduled successfully!");
      setScheduleUser("");
      setScheduleStart("");
      setScheduleEnd("");
      fetchData();
    } catch (err: any) {
      alert(`Failed to schedule window: ${err.message || err}`);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleDeleteWindow = async (windowId: string) => {
    if (!confirm("Cancel this scheduled edit window?")) return;
    try {
      const { error } = await supabase
        .from("edit_windows")
        .delete()
        .eq("id", windowId);

      if (error) throw error;
      showToast("Edit window cancelled.");
      fetchData();
    } catch (err: any) {
      alert(`Error cancelling window: ${err.message || err}`);
    }
  };

  // --- REVERSION (OWNER UNDO) HANDLERS ---
  const handleRevertClick = async (session: EditSession) => {
    if (!confirm(`Revert file "${session.filepath}" back to the snapshot saved by ${session.profile?.username || "Contributor"}?`)) {
      return;
    }

    try {
      setLoading(true);
      await onRevertFile(session.filepath, session.content_snapshot);
      showToast(`Successfully rolled back ${session.filepath}!`);
      fetchData();
    } catch (err: any) {
      alert(`Failed to revert: ${err.message || err}`);
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between font-mono bg-bg text-text-primary text-xs">
      
      {/* Toast Alert Ribbon */}
      {actionMessage && (
        <div className="bg-accent/10 border border-accent text-accent px-3 py-2 text-[10px] uppercase font-bold tracking-wider mb-3 animate-fade-in shrink-0">
          {actionMessage}
        </div>
      )}

      {/* RLS/Safety Gating header */}
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-border shrink-0 select-none">
        <ShieldCheck className="h-4 w-4 text-accent" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">
          Owner Control Center
        </span>
      </div>

      {/* Tabs list navigation */}
      <div className="flex border-b border-border mb-4 text-[10px] font-bold uppercase shrink-0">
        <button 
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-2 border-b-2 transition-all cursor-pointer ${activeTab === "requests" ? "border-accent text-accent bg-accent/5" : "border-transparent text-text-muted hover:text-text-primary"}`}
        >
          Requests ({requests.filter(r => r.status === "pending").length})
        </button>
        <button 
          onClick={() => setActiveTab("contributors")}
          className={`flex-1 py-2 border-b-2 transition-all cursor-pointer ${activeTab === "contributors" ? "border-accent text-accent bg-accent/5" : "border-transparent text-text-muted hover:text-text-primary"}`}
        >
          Roster ({contributors.length})
        </button>
        <button 
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-2 border-b-2 transition-all cursor-pointer ${activeTab === "schedule" ? "border-accent text-accent bg-accent/5" : "border-transparent text-text-muted hover:text-text-primary"}`}
        >
          Slots
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 border-b-2 transition-all cursor-pointer ${activeTab === "history" ? "border-accent text-accent bg-accent/5" : "border-transparent text-text-muted hover:text-text-primary"}`}
        >
          Undo Logs
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-2 border-b-2 transition-all cursor-pointer ${activeTab === "settings" ? "border-accent text-accent bg-accent/5" : "border-transparent text-text-muted hover:text-text-primary"}`}
        >
          Settings
        </button>
      </div>

      {/* Tab Panels body */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="h-full flex items-center justify-center text-text-muted select-none py-8">
            <Loader2 className="h-5 w-5 animate-spin text-accent mr-2" />
            <span>Synchronizing permissions...</span>
          </div>
        ) : (
          <>
            {/* 1. ACCESS REQUESTS PANEL */}
            {activeTab === "requests" && (
              <div className="space-y-3">
                {requests.filter(r => r.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-text-muted italic text-[11px]">
                    No pending access requests.
                  </div>
                ) : (
                  requests.filter(r => r.status === "pending").map(req => (
                    <div key={req.id} className="bg-surface border border-border p-3 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={req.profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=guest"} 
                            alt="Avatar"
                            className="h-5 w-5 rounded-full border border-border bg-[#111]"
                          />
                          <span className="font-bold text-text-primary">{req.profile?.username || "Stranger"}</span>
                        </div>
                        <span className="text-[9px] text-text-muted font-mono">{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {req.message && (
                        <p className="bg-[#080808] border border-border/40 p-2 text-[11px] text-text-muted leading-relaxed font-mono italic">
                          "{req.message}"
                        </p>
                      )}

                      <div className="flex gap-2 text-[10px] pt-1">
                        <button 
                          onClick={() => handleResolveRequest(req.id, req.requester_id, true)}
                          className="flex-1 bg-accent/10 border border-accent/30 text-accent hover:bg-accent hover:text-bg py-1 px-2 uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleResolveRequest(req.id, req.requester_id, false)}
                          className="flex-1 bg-surface border border-border text-text-dim hover:text-accent2 hover:border-accent2/30 py-1 px-2 uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 2. CONTRIBUTORS ROSTER PANEL */}
            {activeTab === "contributors" && (
              <div className="space-y-4">
                {contributors.length === 0 ? (
                  <div className="text-center py-8 text-text-muted italic text-[11px]">
                    No active contributors in workspace.
                  </div>
                ) : (
                  contributors.map(c => (
                    <div key={c.id} className="bg-surface border border-border p-3 space-y-3">
                      <div className="flex items-center justify-between border-b border-border/40 pb-2">
                        <div className="flex items-center gap-2">
                          <img 
                            src={c.profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=guest"} 
                            alt="Avatar"
                            className="h-5 w-5 rounded-full border border-border bg-[#111]"
                          />
                          <span className="font-bold text-accent">{c.profile?.username || "Collaborator"}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleKickContributor(c)}
                          className="text-[9px] uppercase font-bold bg-[#ff6b35]/5 border border-[#ff6b35]/25 text-accent2 hover:bg-accent2 hover:text-text-primary px-2 py-1 transition-all flex items-center gap-1 cursor-pointer"
                          title="Revoke all access & cooldown"
                        >
                          <UserMinus className="h-3 w-3" /> Kick
                        </button>
                      </div>

                      {/* File Permissions Allowed List Checklist */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                            Allowed Files Configuration:
                          </span>
                          {c.allowed_files !== null && (
                            <button
                              onClick={() => handleGrantFullAccess(c.id)}
                              className="text-[8px] uppercase font-bold text-accent hover:underline cursor-pointer"
                            >
                              Grant Full Access
                            </button>
                          )}
                        </div>

                        {files.length === 0 ? (
                          <span className="text-[10px] text-text-muted italic">No files in project</span>
                        ) : (
                          <div className="max-h-36 overflow-y-auto border border-border/40 bg-[#080808] p-2 space-y-1.5 scrollbar-thin">
                            {files
                              // Filter out folders/placeholders
                              .filter(f => f.filename !== ".keep" && f.filename !== ".placeholder")
                              .map(file => {
                                const isAllowed = c.allowed_files === null || c.allowed_files.includes(file.filepath);
                                return (
                                  <label 
                                    key={file.id} 
                                    className="flex items-center gap-2 text-[10px] font-mono text-text-muted hover:text-text-primary cursor-pointer select-none"
                                  >
                                    <input 
                                      type="checkbox"
                                      checked={isAllowed}
                                      disabled={c.allowed_files === null} // Checked/disabled if full access is active
                                      onChange={() => {
                                        if (c.allowed_files === null) return;
                                        handleToggleFilePermission(c.id, file.filepath, !isAllowed, c.allowed_files);
                                      }}
                                      className="rounded bg-[#1a1a1a] border-border text-accent focus:ring-0 checked:bg-accent h-3.5 w-3.5"
                                    />
                                    <span className="truncate">{file.filepath}</span>
                                  </label>
                                );
                              })
                            }
                            {c.allowed_files === null && (
                              <div className="text-[9px] text-accent/80 font-bold uppercase tracking-wider text-center py-1 bg-accent/5 border border-accent/20">
                                Unrestricted Sandbox Access
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. WINDOWS SCHEDULE SCHEDULER PANEL */}
            {activeTab === "schedule" && (
              <div className="space-y-4">
                
                {/* Scheduling form */}
                <form onSubmit={handleScheduleSubmit} className="bg-surface border border-border p-3 space-y-2.5">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold border-b border-border/40 pb-1.5">
                    Schedule Timed Edit Slot
                  </span>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                      Select Contributor
                    </label>
                    <select
                      value={scheduleUser}
                      onChange={(e) => setScheduleUser(e.target.value)}
                      required
                      className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                    >
                      <option value="">-- Choose active developer --</option>
                      {contributors.map(c => (
                        <option key={c.id} value={c.user_id}>
                          {c.profile?.username || "Collaborator"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleStart}
                        onChange={(e) => setScheduleStart(e.target.value)}
                        required
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-[11px] focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduleEnd}
                        onChange={(e) => setScheduleEnd(e.target.value)}
                        required
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-[11px] focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSchedule || !scheduleUser || !scheduleStart || !scheduleEnd}
                    className="w-full bg-accent text-bg hover:bg-accent/80 font-bold uppercase tracking-wider py-1.5 px-3 flex items-center justify-center gap-1.5 transition-all text-[10px] cursor-pointer disabled:opacity-50"
                  >
                    {submittingSchedule ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Calendar className="h-3.5 w-3.5" />
                    )}
                    <span>Commit Schedule Slot</span>
                  </button>
                </form>

                {/* Scheduled Slots Listing */}
                <div className="space-y-2">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold">
                    Active & Upcoming Slots:
                  </span>
                  
                  {windows.length === 0 ? (
                    <div className="text-center py-6 text-text-muted italic text-[11px] bg-surface/50 border border-dashed border-border p-3">
                      No timed slots scheduled yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {windows.map(win => {
                        const now = new Date();
                        const start = new Date(win.start_time);
                        const end = new Date(win.end_time);
                        
                        let isActiveSlot = now >= start && now <= end;
                        let isPassed = now > end;

                        return (
                          <div 
                            key={win.id} 
                            className={`p-2.5 border flex items-center justify-between gap-2 bg-surface transition-all ${
                              isActiveSlot 
                                ? "border-accent bg-accent/5 text-text-primary" 
                                : isPassed 
                                  ? "border-border/30 opacity-60 text-text-dim" 
                                  : "border-border text-text-muted"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className={isActiveSlot ? "text-accent" : ""}>
                                  {win.profile?.username || "Developer"}
                                </span>
                                {isActiveSlot && (
                                  <span className="text-[8px] bg-accent text-bg px-1.5 py-0.2 uppercase font-extrabold tracking-wide">
                                    ACTIVE NOW
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] flex items-center gap-1 font-mono text-text-dim">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {start.toLocaleDateString()} {start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            </div>

                            <button 
                              onClick={() => handleDeleteWindow(win.id)}
                              className="text-text-dim hover:text-accent2 p-1 cursor-pointer shrink-0 transition-colors"
                              title="Cancel Time Slot"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. REVERSION snapshot logs PANEL */}
            {activeTab === "history" && (
              <div className="space-y-2">
                <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold mb-2">
                  Reversion Snapshots History (Undo):
                </span>
                
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-text-muted italic text-[11px] bg-surface/50 border border-dashed border-border p-3">
                    No reversion snapshots recorded.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {sessions.map(sess => (
                      <div key={sess.id} className="bg-surface border border-border p-2.5 flex items-center justify-between gap-3 font-mono">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-text-primary">
                            <FileText className="h-3.5 w-3.5 text-accent shrink-0" />
                            <span className="truncate">{sess.filepath}</span>
                          </div>
                          
                          <div className="text-[9px] text-text-dim flex flex-wrap gap-x-2">
                            <span>by: <strong className="text-text-muted">{sess.profile?.username || "Developer"}</strong></span>
                            <span>• {new Date(sess.created_at).toLocaleDateString()} {new Date(sess.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setDiffSession(sess)}
                            className="text-[9px] font-extrabold uppercase bg-surface border border-border text-text-muted hover:text-text-primary px-2 py-1 flex items-center gap-1.5 tracking-wider transition-all cursor-pointer"
                            title="Compare visual split-diff before reverting"
                          >
                            <Eye className="h-3.5 w-3.5" /> Diff
                          </button>
                          
                          <button
                            onClick={() => handleRevertClick(sess)}
                            className="text-[9px] font-extrabold uppercase bg-accent text-bg hover:bg-accent/85 px-2 py-1 flex items-center gap-1 tracking-wider transition-all shrink-0 cursor-pointer"
                            title="Revert live file to this content snapshot"
                          >
                            <History className="h-3.5 w-3.5" /> Revert
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS PANEL (Webhooks & GitHub Sync) */}
            {activeTab === "settings" && (
              <div className="space-y-6 animate-fade-in pr-1 pb-4">
                
                {/* A. Slack / Discord Webhooks Form */}
                <form onSubmit={handleSaveSettings} className="bg-surface border border-border p-4 space-y-4">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold border-b border-border/40 pb-2 flex items-center gap-1.5 select-none">
                    <Bell className="h-3.5 w-3.5 text-accent" />
                    <span>Real-Time Webhook Alerts</span>
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Channel Type
                      </label>
                      <select
                        value={webhookType}
                        onChange={(e) => setWebhookType(e.target.value as "discord" | "slack")}
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      >
                        <option value="discord">Discord</option>
                        <option value="slack">Slack</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Webhook Target URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-surface border border-border hover:border-accent text-text-primary hover:text-accent font-bold uppercase tracking-wider py-1.5 px-3 flex items-center justify-center gap-1.5 transition-all text-[10px] cursor-pointer"
                  >
                    <span>Save Webhook Configuration</span>
                  </button>
                </form>

                {/* B. GitHub Sync Workspace Form */}
                <form onSubmit={handleGitHubSync} className="bg-surface border border-border p-4 space-y-4">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold border-b border-border/40 pb-2 flex items-center gap-1.5 select-none">
                    <Github className="h-3.5 w-3.5 text-accent" />
                    <span>GitHub Workspace Synchronization</span>
                  </span>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                          Repository Slug
                        </label>
                        <input
                          type="text"
                          placeholder="owner/repository"
                          value={githubRepo}
                          onChange={(e) => setGithubRepo(e.target.value)}
                          required
                          className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                          Target Branch
                        </label>
                        <input
                          type="text"
                          placeholder="main"
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          required
                          className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Personal Access Token (with repo scope)
                      </label>
                      <input
                        type="password"
                        placeholder="ghp_************************************"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        required
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                        Commit Description
                      </label>
                      <input
                        type="text"
                        placeholder="Sync project workspace files"
                        value={githubCommitMessage}
                        onChange={(e) => setGithubCommitMessage(e.target.value)}
                        required
                        className="w-full bg-[#080808] border border-border text-text-primary px-2 py-1 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSyncing || !githubToken || !githubRepo || !githubCommitMessage}
                    className="w-full bg-accent text-bg hover:bg-accent2 font-bold uppercase tracking-wider py-2 px-3 flex items-center justify-center gap-1.5 transition-all text-[10px] cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        <span>Transmitting to GitHub...</span>
                      </>
                    ) : (
                      <>
                        <GitBranch className="h-3.5 w-3.5 mr-1" />
                        <span>Push Workspace to GitHub</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            )}

          </>
        )}
      </div>

      {diffSession && (
        <MonacoDiff
          original={files.find(f => f.filepath === diffSession.filepath)?.content || ""}
          modified={diffSession.content_snapshot}
          filepath={diffSession.filepath}
          onClose={() => setDiffSession(null)}
          onConfirmRevert={() => {
            handleRevertClick(diffSession);
            setDiffSession(null);
          }}
          username={diffSession.profile?.username || "Developer"}
          timestamp={diffSession.created_at}
        />
      )}

    </div>
  );
}
