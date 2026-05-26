"use client";

import React, { useState, useEffect, use } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Code, Calendar, Loader2, ExternalLink, ShieldAlert, FolderIcon 
} from "lucide-react";
import Link from "next/link";

interface Profile {
  id: string;
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
  status?: string;
  created_at?: string;
}

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function PublicProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { username } = use(params);
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // 1. Fetch public profile by username
        const { data: profData, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();

        if (profError) throw profError;

        if (!profData) {
          setErrorMsg(`Developer card "@${username}" does not exist in the Leenout registry.`);
          setLoading(false);
          return;
        }

        setProfile(profData);

        // 2. Fetch projects owned by this user (public only)
        const { data: ownedData, error: ownedError } = await supabase
          .from("projects")
          .select("id, name, description, stack_tags, created_at")
          .eq("owner_id", profData.id)
          .eq("is_public", true);

        if (ownedError) console.error("Error fetching owned projects:", ownedError);

        // 3. Fetch public projects where this user is/was a contributor
        const { data: contribData, error: contribError } = await supabase
          .from("contributors")
          .select(`
            status,
            project:project_id (
              id,
              name,
              description,
              stack_tags,
              is_public,
              created_at
            )
          `)
          .eq("user_id", profData.id);

        if (contribError) console.error("Error fetching contributor projects:", contribError);

        const allWorkspaces: ProjectSummary[] = [];

        if (ownedData) {
          allWorkspaces.push(
            ...ownedData.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              stack_tags: p.stack_tags || [],
              role: "owner" as const,
              created_at: p.created_at
            }))
          );
        }

        if (contribData) {
          contribData.forEach((entry: any) => {
            if (entry.project && entry.project.is_public) {
              allWorkspaces.push({
                id: entry.project.id,
                name: entry.project.name,
                description: entry.project.description,
                stack_tags: entry.project.stack_tags || [],
                role: "contributor" as const,
                status: entry.status,
                created_at: entry.project.created_at
              });
            }
          });
        }

        // Deduplicate workspaces by project ID
        const uniqueWorkspacesMap = new Map<string, ProjectSummary>();
        allWorkspaces.forEach((w) => {
          if (!uniqueWorkspacesMap.has(w.id)) {
            uniqueWorkspacesMap.set(w.id, w);
          }
        });
        
        // Sort by created_at descending
        const sorted = Array.from(uniqueWorkspacesMap.values()).sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );

        setWorkspaces(sorted);

      } catch (err: any) {
        console.error("Profile load exception:", err);
        setErrorMsg(err.message || "Failed to load developer profile.");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfileData();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex-1 bg-bg px-6 py-20 flex flex-col items-center justify-center text-center">
        <ShieldAlert className="h-16 w-16 text-accent2 mb-4 animate-bounce" />
        <h2 className="font-syne text-2xl font-extrabold tracking-tight mb-2">Registry Lookup Failed</h2>
        <p className="text-sm text-text-muted max-w-sm mb-6">{errorMsg}</p>
        <button
          onClick={handleBack}
          className="border border-border hover:border-accent text-xs uppercase tracking-wider font-bold px-6 py-3 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg px-6 py-12 relative select-none">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation header ribbon */}
        <div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider font-semibold mb-6 cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Go Back</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-4">
              <img 
                src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
                alt={profile?.username}
                className="h-16 w-16 border border-border bg-surface2 p-1 rounded-none"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-syne text-3xl font-extrabold tracking-tight text-text-primary">
                    @{profile?.username}
                  </h1>
                  <span className="text-[9px] bg-accent/10 border border-accent/30 text-accent font-bold uppercase tracking-wider px-2 py-0.5 rounded-none font-mono">
                    Developer Card
                  </span>
                </div>
                <p className="text-xs text-text-muted font-mono flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span>Joined Registry: {profile ? new Date(profile.created_at).toLocaleDateString() : "recently"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Sidebar Skills list */}
          <div className="glass-panel p-6 border border-border space-y-4">
            <h3 className="font-syne text-xs font-bold uppercase tracking-widest text-text-muted border-b border-border pb-2 flex items-center gap-1.5">
              <Code className="h-4 w-4 text-accent" /> Tech Stack Specializations
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {profile?.stack_tags && profile.stack_tags.length > 0 ? (
                profile.stack_tags.map(tag => (
                  <span key={tag} className="bg-surface2 border border-border text-text-primary text-[10px] px-2.5 py-1 font-mono font-bold uppercase tracking-wider">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-text-dim italic">No custom tech stack configured.</span>
              )}
            </div>

            <div className="pt-4 border-t border-border/40 text-[10px] text-text-dim leading-relaxed font-mono">
              Leenout stranger-to-stranger collaborative networking signature code. Profiles are fully public.
            </div>
          </div>

          {/* Core Projects Portfolio List */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="font-syne text-sm font-extrabold uppercase tracking-widest text-accent flex items-center gap-2">
              <FolderIcon className="h-4 w-4 text-accent shrink-0" />
              <span>Workspace Portfolios ({workspaces.length})</span>
            </h2>

            {workspaces.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border bg-surface/50">
                <p className="text-xs text-text-muted italic">This developer has not participated in any public workspaces yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaces.map(proj => (
                  <div key={proj.id} className="glass-panel p-6 border border-border hover:border-accent transition-all duration-300 relative group">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-syne text-lg font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors truncate">
                        {proj.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 shrink-0 select-none">
                        <span className={`text-[8px] uppercase tracking-widest font-mono font-bold px-2 py-0.5 border ${
                          proj.role === "owner" 
                            ? "bg-accent/5 border-accent/20 text-accent" 
                            : "bg-accent2/10 border-accent2/35 text-accent2"
                        }`}>
                          {proj.role === "owner" ? "Owner" : `Collaborator (${proj.status || "active"})`}
                        </span>
                        
                        <Link
                          href={`/project/${proj.id}`}
                          className="text-[10px] uppercase font-bold tracking-wider bg-accent/5 border border-accent/20 hover:bg-accent hover:text-bg px-2.5 py-1 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Enter Studio</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2 mb-4 font-mono">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {proj.stack_tags.slice(0, 4).map(tag => (
                        <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[9px] font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
