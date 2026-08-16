"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { 
  Users, CheckCircle2, XCircle, Clock, ShieldCheck, Mail, Code, ExternalLink, RefreshCw, Layers, ArrowRight, FolderOpen, Loader2 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AccessRequest {
  id: string;
  project_id: string;
  projectName: string;
  requester_id: string;
  requesterUsername: string;
  requesterAvatar: string;
  message: string;
  status: "pending" | "approved" | "denied";
  created_at: string;
}

interface UserProject {
  id: string;
  name: string;
  description: string;
  stack_tags: string[];
  open_roles: string[];
  watch_count?: number;
  contribution_count?: number;
}

interface CollabProject {
  id: string;
  name: string;
  description: string;
  stack_tags: string[];
  ownerUsername: string;
  ownerAvatar: string;
}

export default function DashboardHubPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [myProjects, setMyProjects] = useState<UserProject[]>([]);
  const [collabProjects, setCollabProjects] = useState<CollabProject[]>([]);
  const [watchedProjects, setWatchedProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"workspaces" | "pitches" | "collaborations" | "watched">("workspaces");
  
  const [loading, setLoading] = useState(false);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("stack_tags")
          .eq("id", userId)
          .single();

        if (data && !error) {
          if (!data.stack_tags || data.stack_tags.length === 0) {
            router.push("/create-profile");
          }
        }
      } catch (err) {
        // Fail silently without leaking database error traces to browser console
      }
    };

    // 1. Get Auth Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setSessionLoaded(true);
      if (currentUser) {
        checkOnboarding(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      setSessionLoaded(true);
      if (currentUser) {
        checkOnboarding(currentUser.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // 2. Fetch live requests and owned projects if authenticated
    const loadRequests = async () => {
      try {
        setLoading(true);
        // Get user owned projects with real watch and contribution counts
        const { data: userProjects, error: projectError } = await supabase
          .from("projects")
          .select(`
            id, name, description, stack_tags, open_roles,
            project_watchers ( user_id ),
            contributors ( user_id, status )
          `)
          .eq("owner_id", user?.id);

        if (userProjects && !projectError) {
          setMyProjects(userProjects.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            stack_tags: p.stack_tags || [],
            open_roles: p.open_roles || [],
            watch_count: p.project_watchers?.length || 0,
            contribution_count: p.contributors?.filter((c: any) => c.status === "active")?.length || 0
          })));

          if (userProjects.length > 0) {
            const projectIds = userProjects.map(p => p.id);
            
            // Get pending requests for these projects
            const { data: reqData, error: reqError } = await supabase
              .from("access_requests")
              .select(`
                *,
                profiles:requester_id ( username, avatar_url )
              `)
              .in("project_id", projectIds);

            if (reqData && !reqError) {
              const formatted: AccessRequest[] = reqData.map((r: any) => {
                const proj = userProjects.find(p => p.id === r.project_id);
                return {
                  id: r.id,
                  project_id: r.project_id,
                  projectName: proj?.name || "My Project",
                  requester_id: r.requester_id,
                  requesterUsername: r.profiles?.username || "stranger",
                  requesterAvatar: r.profiles?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback",
                  message: r.message,
                  status: r.status,
                  created_at: r.created_at
                };
              });
              setRequests(formatted);
            }
          } else {
            setRequests([]);
          }
        }

        // Fetch active collaborations/joined projects where user is an active contributor
        const { data: collabData, error: collabError } = await supabase
          .from("contributors")
          .select(`
            project_id,
            projects:project_id (
              id,
              name,
              description,
              stack_tags,
              owner_id,
              profiles:owner_id ( username, avatar_url )
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "active");

        if (collabData && !collabError) {
          const formattedCollabs: CollabProject[] = collabData
            .filter((c: any) => c.projects !== null && c.projects !== undefined)
            .map((c: any) => ({
              id: c.projects.id,
              name: c.projects.name,
              description: c.projects.description,
              stack_tags: c.projects.stack_tags || [],
              ownerUsername: c.projects.profiles?.username || "owner",
              ownerAvatar: c.projects.profiles?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"
            }));
          setCollabProjects(formattedCollabs);
        } else {
          setCollabProjects([]);
        }

        // Fetch projects the user is watching
        const { data: watchData, error: watchError } = await supabase
          .from("project_watchers")
          .select(`
            project_id,
            projects:project_id (
              id,
              name,
              description,
              stack_tags,
              owner_id,
              profiles:owner_id ( username, avatar_url ),
              project_watchers ( user_id ),
              contributors ( user_id, status )
            )
          `)
          .eq("user_id", user.id);

        if (watchData && !watchError) {
          const formattedWatched: any[] = watchData
            .filter((w: any) => w.projects !== null && w.projects !== undefined)
            .map((w: any) => ({
              id: w.projects.id,
              name: w.projects.name,
              description: w.projects.description,
              stack_tags: w.projects.stack_tags || [],
              ownerUsername: w.projects.profiles?.username || "owner",
              ownerAvatar: w.projects.profiles?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback",
              watch_count: w.projects.project_watchers?.length || 0,
              contribution_count: w.projects.contributors?.filter((c: any) => c.status === "active")?.length || 0
            }));
          setWatchedProjects(formattedWatched);
        } else {
          setWatchedProjects([]);
        }

      } catch (e) {
        // Fail silently without leaking database error traces to browser console
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRequests();
    } else {
      setMyProjects([]);
      setRequests([]);
      setCollabProjects([]);
      setWatchedProjects([]);
    }
  }, [user]);

  const handleResolveRequest = async (requestId: string, status: "approved" | "denied") => {
    setActionMessage(null);
    try {
      // 1. Database Update (if authenticated)
      if (user) {
        const targetReq = requests.find(r => r.id === requestId);
        if (targetReq) {
          // Update request table
          const { error } = await supabase
            .from("access_requests")
            .update({ status, resolved_at: new Date().toISOString() })
            .eq("id", requestId);
          
          if (error) throw error;

          // If approved, insert into contributors
          if (status === "approved") {
            const { error: contribError } = await supabase
              .from("contributors")
              .insert({
                project_id: targetReq.project_id,
                user_id: targetReq.requester_id,
                status: "active"
              });
            if (contribError && contribError.code !== "23505") { // Ignore duplicates
              throw contribError;
            }
          }
        }
      }

      // Update state locally
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status } : req
      ));

      setActionMessage(`Request successfully resolved as ${status.toUpperCase()}!`);
      setTimeout(() => setActionMessage(null), 3000);

    } catch (err: any) {
      setActionMessage("We couldn't resolve this pitch request right now. Please try again later.");
    }
  };

  const pendingRequests = requests.filter(r => r.status === "pending");
  const resolvedRequests = requests.filter(r => r.status !== "pending");

  if (!sessionLoaded || (loading && requests.length === 0 && myProjects.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (sessionLoaded && !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg p-6 text-center min-h-[60vh] font-mono">
        <ShieldCheck className="h-12 w-12 text-accent mb-4 animate-pulse" />
        <h1 className="font-syne text-xl font-bold uppercase tracking-wider text-text-primary mb-2">
          Authentication Required
        </h1>
        <p className="text-xs text-text-muted max-w-sm mb-6 leading-relaxed">
          You must be authenticated with GitHub to access the Collaborations Console, track your workspaces, and pitch to other developers.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-5 py-2.5 bg-surface border border-border text-xs text-text-primary font-bold hover:border-accent hover:text-accent transition-colors uppercase cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg px-6 py-12 relative font-mono">
      <div className="max-w-7xl mx-auto">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-8 mb-10 select-none">
          <div>
            <h1 className="font-syne text-4xl font-extrabold tracking-tight mb-2">
              Collaborations <span className="text-accent">Console</span>
            </h1>
            <p className="text-xs text-text-muted">
              Manage incoming collaboration request pitches, track active contributors, and gate entry to your project assets.
            </p>
          </div>

          <div className="flex gap-4 mt-6 md:mt-0">
            <Link 
              href="/create" 
              className="bg-accent hover:bg-accent2 text-bg hover:text-bg text-xs font-bold uppercase tracking-widest px-5 py-3 transition-all duration-300"
            >
              Launch New Workspace
            </Link>
          </div>
        </div>

        {actionMessage && (
          <div className="p-4 bg-note-bg border border-note-border text-accent text-xs mb-6 max-w-md uppercase tracking-wider font-semibold">
            {actionMessage}
          </div>
        )}

        {/* Dashboard Tabs Selector */}
        <div className="flex border-b border-border mb-8 select-none">
          <button
            onClick={() => setActiveTab("workspaces")}
            className={`px-6 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === "workspaces"
                ? "border-accent text-accent bg-accent/5 font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            My Workspaces ({myProjects.length})
          </button>
          
          <button
            onClick={() => setActiveTab("pitches")}
            className={`px-6 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === "pitches"
                ? "border-accent text-accent bg-accent/5 font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Incoming Pitches</span>
            {pendingRequests.length > 0 && (
              <span className="absolute top-2.5 right-1.5 h-2 w-2 bg-accent2 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("collaborations")}
            className={`px-6 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === "collaborations"
                ? "border-accent text-accent bg-accent/5 font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Active Collaborations ({collabProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("watched")}
            className={`px-6 py-3 text-xs uppercase font-bold tracking-wider border-b-2 transition-all cursor-pointer relative ${
              activeTab === "watched"
                ? "border-accent text-accent bg-accent/5 font-extrabold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span>Watched Projects ({watchedProjects.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          
          {/* Main List Box */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* TAB 1: WORKSPACES LISTING */}
            {activeTab === "workspaces" && (
              <div className="space-y-6">
                {myProjects.length === 0 ? (
                  <div className="glass-panel p-12 text-center border border-dashed border-border">
                    <p className="text-xs text-text-muted mb-4">You haven't launched any workspaces yet.</p>
                    <Link 
                      href="/create" 
                      className="text-xs text-accent hover:underline uppercase font-bold"
                    >
                      Create Your First Project Card.. 
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {myProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="glass-panel p-6 border border-border flex flex-col justify-between hover:border-accent/40 transition-colors duration-200 relative group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3.5">
                            <h3 className="font-syne text-lg font-bold text-text-primary">
                              {project.name}
                            </h3>
                            <span className="text-[9px] uppercase bg-surface2 border border-border px-2 py-0.5 text-text-muted">
                              Owner
                            </span>
                          </div>

                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4">
                            {project.description}
                          </p>

                          {/* Stack Tags */}
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1.5">
                              {project.stack_tags.slice(0, 3).map(tag => (
                                <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[10px]">
                                  {tag}
                                </span>
                              ))}
                              {project.stack_tags.length > 3 && (
                                <span className="text-[10px] text-text-muted">+{project.stack_tags.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-border flex items-center justify-between mt-4">
                          <span className="text-[10px] text-text-muted font-light">
                            {project.watch_count || 0} watching
                          </span>
                          
                          <Link
                            href={`/project/${project.id}`}
                            className="bg-accent/10 border border-accent/20 hover:border-accent hover:bg-accent/20 text-accent px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>Launch Studio</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INCOMING PITCHES (PENDING REQUESTS) */}
            {activeTab === "pitches" && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between mb-6 select-none">
                    <h2 className="font-syne text-lg font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>Pending Requests ({pendingRequests.length})</span>
                    </h2>
                  </div>

                  {pendingRequests.length === 0 ? (
                    <div className="glass-panel p-12 text-center border border-dashed border-border">
                      <p className="text-xs text-text-muted">No pending entry requests currently in queue.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map(req => (
                        <div key={req.id} className="glass-panel p-6 border border-border flex flex-col md:flex-row items-start gap-5 relative">
                          <img 
                            src={req.requesterAvatar} 
                            alt={req.requesterUsername} 
                            className="h-12 w-12 border border-border bg-surface2 rounded-none p-1 shrink-0" 
                          />
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="font-syne font-bold text-text-primary text-sm">@{req.requesterUsername}</span>
                              <span className="text-[10px] text-text-muted">requested access for</span>
                              <span className="text-[11px] text-accent font-semibold uppercase tracking-wider">{req.projectName}</span>
                            </div>
                            
                            <p className="text-xs text-text-primary/95 leading-relaxed bg-surface/50 p-3.5 border-l border-border italic">
                              "{req.message}"
                            </p>

                            <div className="pt-2 flex flex-wrap items-center gap-3">
                              <button
                                onClick={() => handleResolveRequest(req.id, "approved")}
                                className="bg-accent/10 border border-accent/30 hover:border-accent text-accent px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Approve Access
                              </button>
                              
                              <button
                                onClick={() => handleResolveRequest(req.id, "denied")}
                                className="bg-accent2/10 border border-accent2/30 hover:border-accent2 text-accent2 px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Deny
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolved Requests */}
                {resolvedRequests.length > 0 && (
                  <div>
                    <h3 className="font-syne text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
                      Archive History
                    </h3>
                    <div className="space-y-3">
                      {resolvedRequests.map(req => (
                        <div key={req.id} className="glass-panel p-4 border border-border/40 bg-surface/10 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img src={req.requesterAvatar} alt="" className="h-6 w-6 border border-border p-0.5" />
                            <span>@{req.requesterUsername}</span>
                            <span className="text-text-muted">for</span>
                            <span className="text-text-primary font-mono">{req.projectName}</span>
                          </div>
                          
                          <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 border ${
                            req.status === "approved"
                              ? "border-accent/40 bg-accent/5 text-accent"
                              : "border-accent2/40 bg-accent2/5 text-accent2"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ACTIVE COLLABORATIONS */}
            {activeTab === "collaborations" && (
              <div className="space-y-6 animate-fade-in">
                {collabProjects.length === 0 ? (
                  <div className="glass-panel p-12 text-center border border-dashed border-border">
                    <p className="text-xs text-text-muted mb-4">You are not contributing to any external workspaces yet.</p>
                    <Link 
                      href="/" 
                      className="text-xs text-accent hover:underline uppercase font-bold"
                    >
                      Explore the marketplace to find open workspaces..
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {collabProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="glass-panel p-6 border border-border flex flex-col justify-between hover:border-accent2/40 transition-colors duration-200 relative group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3.5">
                            <h3 className="font-syne text-lg font-bold text-text-primary group-hover:text-accent2 transition-colors duration-200">
                              {project.name}
                            </h3>
                            <span className="text-[9px] uppercase bg-surface2 border border-border px-2 py-0.5 text-text-muted font-bold tracking-wider">
                              Contributor
                            </span>
                          </div>

                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4 font-mono">
                            {project.description}
                          </p>

                          {/* Owner Profile Badge */}
                          <div className="flex items-center gap-2 mb-4 bg-surface/50 border border-border/40 p-2 select-none">
                            <img 
                              src={project.ownerAvatar} 
                              alt={project.ownerUsername} 
                              className="h-5 w-5 border border-border p-0.5 shrink-0" 
                            />
                            <span className="text-[10px] text-text-muted">
                              Workspace Owner: <Link href={`/profile/${project.ownerUsername}`} className="text-accent hover:underline font-bold font-mono">@{project.ownerUsername}</Link>
                            </span>
                          </div>

                          {/* Stack Tags */}
                          <div>
                            <div className="flex flex-wrap gap-1.5">
                              {project.stack_tags.slice(0, 3).map(tag => (
                                <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[9px] font-mono">
                                  {tag}
                                </span>
                              ))}
                              {project.stack_tags.length > 3 && (
                                <span className="text-[9px] text-text-muted font-mono">+{project.stack_tags.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-border flex items-center justify-end mt-4">
                          <Link
                            href={`/project/${project.id}`}
                            className="bg-accent2/10 border border-accent2/20 hover:border-accent2 hover:bg-accent2/20 text-accent2 px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>Enter Workspace Studio</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: WATCHED PROJECTS */}
            {activeTab === "watched" && (
              <div className="space-y-6 animate-fade-in">
                {watchedProjects.length === 0 ? (
                  <div className="glass-panel p-12 text-center border border-dashed border-border select-none">
                    <p className="text-xs text-text-muted mb-4 font-mono">You are not watching any workspaces yet.</p>
                    <Link 
                      href="/" 
                      className="text-xs text-accent hover:underline uppercase font-bold font-mono"
                    >
                      Explore the marketplace to watch interesting projects..
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {watchedProjects.map(project => (
                      <div 
                        key={project.id} 
                        className="glass-panel p-6 border border-border flex flex-col justify-between hover:border-accent/40 transition-colors duration-200 relative group"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3.5 select-none">
                            <h3 className="font-syne text-lg font-bold text-text-primary group-hover:text-accent transition-colors duration-200">
                              {project.name}
                            </h3>
                            <span className="text-[9px] uppercase bg-accent/10 border border-accent/20 px-2 py-0.5 text-accent font-bold tracking-wider rounded-sm font-mono">
                              Watching
                            </span>
                          </div>

                          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4 font-mono">
                            {project.description}
                          </p>

                          {/* Owner Profile Badge */}
                          <div className="flex items-center gap-2 mb-4 bg-surface/50 border border-border/40 p-2 select-none">
                            <img 
                              src={project.ownerAvatar} 
                              alt={project.ownerUsername} 
                              className="h-5 w-5 border border-border p-0.5 shrink-0" 
                            />
                            <span className="text-[10px] text-text-muted font-mono">
                              Workspace Owner: <Link href={`/profile/${project.ownerUsername}`} className="text-accent hover:underline font-bold font-mono">@{project.ownerUsername}</Link>
                            </span>
                          </div>

                          {/* Stack Tags */}
                          <div>
                            <div className="flex flex-wrap gap-1.5 select-none">
                              {project.stack_tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[9px] font-mono">
                                  {tag}
                                </span>
                              ))}
                              {project.stack_tags.length > 3 && (
                                <span className="text-[9px] text-text-muted font-mono">+{project.stack_tags.length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-4 border-t border-border flex items-center justify-between mt-4">
                          <span className="text-[10px] text-text-muted font-light font-mono select-none">
                            {project.watch_count || 0} watching • {project.contribution_count || 0} active
                          </span>
                          
                          <Link
                            href={`/project/${project.id}`}
                            className="bg-accent/10 border border-accent/20 hover:border-accent hover:bg-accent/20 text-accent px-4 py-2 text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer font-mono"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>Enter Studio</span>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar Panels */}
          <div className="space-y-6">
            
            {/* Quick Metrics Inspector */}
            <div className="glass-panel p-6 border border-border space-y-4">
              <h3 className="font-syne text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border pb-3 mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Console Status</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 border border-border">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold mb-1">
                    Approval Rate
                  </span>
                  <span className="text-2xl font-syne font-extrabold text-accent">
                    78%
                  </span>
                </div>

                <div className="bg-surface p-4 border border-border">
                  <span className="block text-[9px] uppercase tracking-wider text-text-muted font-bold mb-1">
                    Active Coder
                  </span>
                  <span className="text-2xl font-syne font-extrabold text-text-primary">
                    12
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Live Terminal Streams */}
            <div className="glass-panel p-6 border border-border bg-[#050505] space-y-3 font-mono text-[10px] text-text-muted">
              <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 bg-accent rounded-full animate-ping" />
                  <span className="uppercase tracking-widest font-bold text-accent">Active Streams</span>
                </div>
                <RefreshCw className="h-3 w-3 text-text-dim" />
              </div>
              <p className="text-accent">[SYSTEM] Gating active sockets...</p>
              <p>[DB] Hooked row-level session mappings.</p>
              <p>[AUTH] GitHub token scope: public_profile verified.</p>
              <p className="text-accent2">[MOCK] Email alerts logged for Resend dispatcher.</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
