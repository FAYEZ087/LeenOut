"use client";

import React, { useState, useEffect } from "react";
import ProjectCard, { Project } from "@/components/project-card";
import { supabase } from "@/utils/supabaseClient";
import { Search, Filter, Sparkles, Send, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";

export default function DiscoveryFeedPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Auth and Request States
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [watchedProjectIds, setWatchedProjectIds] = useState<string[]>([]);
  const [requestingProject, setRequestingProject] = useState<Project | null>(null);
  const [pitchMessage, setPitchMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestStatus, setRequestStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch logged in user profile stack tags and watched projects
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setWatchedProjectIds([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("stack_tags")
          .eq("id", user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }

        const { data: watches } = await supabase
          .from("project_watchers")
          .select("project_id")
          .eq("user_id", user.id);

        if (watches) {
          setWatchedProjectIds(watches.map(w => w.project_id));
        }
      } catch (err) {
        console.warn("Failed to load user profile or watchlist details:", err);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    // 1. Fetch user auth details
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // 2. Fetch actual projects if connected to real Supabase
    const loadProjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            profiles:owner_id ( username ),
            project_watchers ( user_id ),
            contributors ( user_id, status )
          `);
        
        if (data && !error) {
          const formattedProjects = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            purpose: p.purpose,
            stack_tags: p.stack_tags || [],
            open_roles: p.open_roles || [],
            current_problem: p.current_problem || '',
            owner_id: p.owner_id,
            owner_username: p.profiles?.username || "owner",
            watch_count: p.project_watchers?.length || 0,
            contribution_count: p.contributors?.filter((c: any) => c.status === "active")?.length || 0
          }));
          setProjects(formattedProjects);
        } else {
          setProjects([]);
        }
      } catch (e) {
        console.error("Failed to load projects:", e);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();

    return () => subscription.unsubscribe();
  }, []);

  // Aggregated Tags & Roles from current loaded projects
  const allTags = Array.from(new Set(projects.flatMap(p => p.stack_tags)));
  const allRoles = Array.from(new Set(projects.flatMap(p => p.open_roles)));


  // Filtering Logic
  const filteredProjects = projects.filter(proj => {
    const matchesSearch = 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag ? proj.stack_tags.includes(selectedTag) : true;
    const matchesRole = selectedRole ? proj.open_roles.includes(selectedRole) : true;

    return matchesSearch && matchesTag && matchesRole;
  });

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingProject) return;

    setSendingRequest(true);
    setRequestStatus(null);

    try {
      // 1. Submit Request to Supabase (if authenticated)
      if (user) {
        const { error } = await supabase.from("access_requests").insert({
          project_id: requestingProject.id,
          requester_id: user.id,
          message: pitchMessage,
          status: "pending"
        });
        if (error && error.code !== "23505") { // Ignore duplicates for prototype
          throw error;
        }
      }

      // 2. Alert Express Backend API for Email Mocking notification!
      const notifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notify-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: requestingProject.id,
          projectOwnerEmail: "owner@leenout.dev", // mock routing
          projectName: requestingProject.name,
          requesterUsername: user ? (user.user_metadata?.user_name || user.email) : "stranger_coder",
          message: pitchMessage
        })
      });

      if (!notifyResponse.ok) {
        console.warn("Backend notification failed to register.");
      }

      setRequestStatus({
        type: "success",
        text: `Your collaboration request for "${requestingProject.name}" has been logged! The project owner has been notified.`,
      });

      // Clear input fields
      setPitchMessage("");
      setTimeout(() => {
        setRequestingProject(null);
        setRequestStatus(null);
      }, 3500);

    } catch (err: any) {
      let errorMessage = err.message || "Failed to submit collaboration request.";
      if (errorMessage.includes("row-level security policy") || errorMessage.includes("violates row-level security")) {
        errorMessage = "Submission blocked: You are currently on an active kick cooldown for this project, or you already have an active request.";
      }
      setRequestStatus({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="flex-1 bg-bg px-6 py-12 relative overflow-hidden">
      
      {/* Hero Header Block */}
      <section className="max-w-7xl mx-auto text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 border border-accent/20 bg-accent/5 px-4 py-1.5 mb-6 text-xs uppercase tracking-wider text-accent font-semibold">
          <Sparkles className="h-4 w-4" />
          <span>Strangers collaborating on real codebases</span>
        </div>
        <h1 className="font-syne text-5xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
          Lean out and see what's <br />
          being <span className="text-accent"> built next door</span>.
        </h1>
        <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto leading-relaxed">
          No pull requests. No waiting. Browse live codebases, request scheduled edit windows, and make impactful additions with immediate feedback.
        </p>
      </section>

      {/* Exploration Marketplace Container */}
      <section className="max-w-7xl mx-auto relative z-10">
        
        {/* Search and Filters Strip */}
        <div className="glass-panel p-4 mb-10 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by keywords, problems, purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-text-primary px-4 py-3 pl-11 text-xs focus:border-accent focus:outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-text-muted" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Tag Filter */}
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 border border-border">
              <Filter className="h-3 w-3 text-text-muted" />
              <select
                value={selectedTag || ""}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-surface text-text-primary">All Stacks</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag} className="bg-surface text-text-primary">{tag}</option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 bg-surface px-3 py-1.5 border border-border">
              <Filter className="h-3 w-3 text-text-muted" />
              <select
                value={selectedRole || ""}
                onChange={(e) => setSelectedRole(e.target.value || null)}
                className="bg-transparent text-xs text-text-primary focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-surface text-text-primary">All Roles</option>
                {allRoles.map(role => (
                  <option key={role} value={role} className="bg-surface text-text-primary">{role}</option>
                ))}
              </select>
            </div>

            {(selectedTag || selectedRole || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedTag(null);
                  setSelectedRole(null);
                  setSearchQuery("");
                }}
                className="text-xs text-accent2 hover:underline tracking-wider uppercase font-semibold pl-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-surface/30 border border-border">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border bg-surface/50">
            <p className="text-sm text-text-muted mb-2">No active projects found matching your criteria.</p>
            <p className="text-xs text-text-dim">Try adjusting filters or searching for other terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onRequestAccess={(p) => setRequestingProject(p)}
                currentUserId={user?.id}
                userTags={userProfile?.stack_tags || []}
                initialIsWatched={watchedProjectIds.includes(project.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Collaboration Access Modal Overlay */}
      {requestingProject && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="w-full max-w-lg glass-panel relative z-10 shadow-2xl p-6 border border-border">
            
            <div className="flex items-start justify-between border-b border-border pb-4 mb-6">
              <div>
                <h3 className="font-syne text-xl font-bold tracking-tight text-text-primary">
                  Request Collaboration Access
                </h3>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-1">
                  Targeting Project: <span className="text-accent">{requestingProject.name}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setRequestingProject(null);
                  setRequestStatus(null);
                }}
                className="text-text-muted hover:text-text-primary text-xs uppercase font-semibold tracking-wider cursor-pointer"
              >
                Close
              </button>
            </div>

            {requestStatus ? (
              <div className="py-8 text-center space-y-4">
                {requestStatus.type === "success" ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-16 w-16 text-accent mb-4 animate-bounce" />
                    <p className="font-syne text-lg font-bold uppercase tracking-wider text-accent mb-2">
                      Request Transmitted
                    </p>
                    <p className="text-xs text-text-muted max-w-sm">
                      {requestStatus.text}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ShieldAlert className="h-16 w-16 text-accent2 mb-4" />
                    <p className="font-syne text-lg font-bold uppercase tracking-wider text-accent2 mb-2">
                      Submission Blocked
                    </p>
                    <p className="text-xs text-text-muted max-w-sm">
                      {requestStatus.text}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-6">
                
                {/* Visual Owner Notice */}
                {!user && (
                  <div className="bg-warning-bg border border-warning-border p-3.5 text-xs text-text-primary">
                    <span className="block font-semibold uppercase tracking-wider text-accent2 mb-1">
                      Developer Warning
                    </span>
                    You are not signed in. Submitting a request now will execute a prototype simulation and alert the developer logs. Sign in to link requests with your permanent developer card profile.
                  </div>
                )}

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-semibold"
                  >
                    Your Dev Pitch (Tell the owner why they should let you edit)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Hey! I see you are stuck on this issue..."
                    value={pitchMessage}
                    onChange={(e) => setPitchMessage(e.target.value)}
                    required
                    className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setRequestingProject(null)}
                    className="border border-border hover:border-text-primary text-text-muted hover:text-text-primary px-5 py-2.5 text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingRequest}
                    className="bg-accent hover:bg-accent2 text-bg hover:text-bg px-6 py-2.5 text-xs uppercase tracking-wider font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {sendingRequest ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4.5 w-4.5" />
                        <span>Transmit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
