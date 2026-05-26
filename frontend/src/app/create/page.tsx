"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Sparkles, Terminal, Rocket, Plus, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { STARTER_BOILERPLATE } from "@/components/starter-template";

export default function CreateProjectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Stepper state variables
  const [projectName, setProjectName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [currentProblem, setCurrentProblem] = useState("");
  
  // Custom arrays inputs state
  const [tagInput, setTagInput] = useState("");
  const [stackTags, setStackTags] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [openRoles, setOpenRoles] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

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

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleInput.trim() && !openRoles.includes(roleInput.trim())) {
      setOpenRoles([...openRoles, roleInput.trim()]);
      setRoleInput("");
    }
  };

  const handleRemoveRole = (index: number) => {
    setOpenRoles(openRoles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !purpose || !description || stackTags.length === 0 || openRoles.length === 0) {
      setErrorMsg("Please complete all required fields and add at least one stack tag and open role.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (user) {
        // Double-check if the profile exists in public.profiles. If missing, auto-create it (Self-Healing Profile)
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (profileCheckError || !profileCheck) {
          console.log("[CREATE] Profile missing in public.profiles. Auto-creating profile for:", user.id);
          const { error: profileCreateError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: user.user_metadata?.user_name || user.user_metadata?.preferred_username || user.email?.split("@")[0] || `coder_${user.id.substring(0, 8)}`,
              avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
              stack_tags: []
            });

          if (profileCreateError) {
            console.error("[CREATE] Self-healing profile creation failed:", profileCreateError);
            throw new Error(`Profile initialization failed: ${profileCreateError.message}`);
          }
        }

        // Authenticated Database push with returned project ID
        const { data, error } = await supabase.from("projects").insert({
          owner_id: user.id,
          name: projectName,
          description,
          purpose,
          stack_tags: stackTags,
          open_roles: openRoles,
          current_problem: currentProblem,
          is_public: true
        }).select("id").single();

        if (error) {
          console.error("[CREATE] Project insert rejected:", error);
          throw error;
        }

        if (data?.id) {
          // Pre-populate project with default starter neon boilerplate!
          const { error: filesError } = await supabase.from("project_files").insert(
            STARTER_BOILERPLATE.map(file => ({
              project_id: data.id,
              filename: file.filename,
              filepath: file.filepath,
              content: file.content,
              last_edited_by: user.id
            }))
          );
          if (filesError) {
            console.error("Failed to inject starter boilerplate:", filesError);
          }
        }
      } else {
        // Unauthenticated Sandbox Simulation logging
        console.log(`[PROTOTYPE] Project Created Locally:`, {
          name: projectName,
          purpose,
          description,
          stack_tags: stackTags,
          open_roles: openRoles,
          current_problem: currentProblem
        });
      }

      setSuccessMsg("Success! Your collaborative project card is active. Returning you to the marketplace.");
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (err: any) {
      console.error("[PROJECT CREATE EXCEPTION]", err);
      setErrorMsg(err.message || "Failed to create project.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-bg px-6 py-12 relative">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 items-stretch">
        
        {/* Left Side Inputs Form */}
        <div className="flex-1 glass-panel p-8 border border-border relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent" />
          
          <div className="mb-8">
            <button 
              type="button"
              onClick={handleBack} 
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider font-semibold mb-4 cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Marketplace</span>
            </button>
            <h2 className="font-syne text-3xl font-extrabold tracking-tight mb-2">
              Launch a <span className="text-accent">Workspace</span>
            </h2>
            <p className="text-xs text-text-muted">
              Define your project card details. Make your current blockers clear to attract relevant helpers.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 bg-warning-bg border border-warning-border text-accent2 text-xs mb-6">
              <span className="block font-semibold uppercase tracking-wider mb-1">Configuration Error</span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-note-bg border border-note-border text-accent text-xs mb-6">
              <span className="block font-semibold uppercase tracking-wider mb-1">System Action Complete</span>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                placeholder="e.g. CssMorph"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all"
              />
            </div>

            {/* Purpose - One liner */}
            <div>
              <label htmlFor="purpose" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                What is it for? (1-Sentence Pitch) *
              </label>
              <input
                type="text"
                id="purpose"
                placeholder="e.g. A sandbox to create custom glassmorphism visual CSS tokens in real-time."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="desc" className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                Detailed Context Description *
              </label>
              <textarea
                id="desc"
                rows={4}
                placeholder="Explain the background, core goals, and general codebase flow..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all font-mono"
              />
            </div>

            {/* Dynamic Stack Tags */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                Target Technologies Stack (Min 1) *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Rust, Next.js"
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
              </div>
            </div>

            {/* Dynamic Open Roles */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-muted mb-2 font-bold">
                Open Collaboration Roles Needed (Min 1) *
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g. Seeking CSS specialist, AST optimizer"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="flex-1 bg-surface border border-border text-text-primary px-4 py-2.5 text-xs focus:border-accent focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="bg-surface hover:bg-surface2 text-accent2 border border-border hover:border-accent2 px-4 py-2 text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {openRoles.map((role, idx) => (
                  <span key={idx} className="border border-accent2/25 bg-accent2/5 text-accent2 text-[10px] pl-2.5 pr-1 py-1 flex items-center gap-1.5 font-mono">
                    {role}
                    <button type="button" onClick={() => handleRemoveRole(idx)} className="text-text-muted hover:text-accent transition-colors cursor-pointer">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Current Problem Hook */}
            <div>
              <label htmlFor="problem" className="block text-[10px] uppercase tracking-wider text-accent mb-2 font-bold">
                Current Developer Problem (The Hook / Optional)
              </label>
              <input
                type="text"
                id="problem"
                placeholder="e.g. backdrop-blur causes paint lag issues on iOS browsers."
                value={currentProblem}
                onChange={(e) => setCurrentProblem(e.target.value)}
                className="w-full bg-surface border border-border text-text-primary px-4 py-3 text-xs focus:border-accent focus:outline-none transition-all"
              />
            </div>

            {/* Warning if unauthenticated */}
            {!user && (
              <div className="bg-warning-bg border border-warning-border p-3.5 text-xs text-text-primary">
                <span className="block font-semibold uppercase tracking-wider text-accent2 mb-1">
                  Developer Notice
                </span>
                You are currently unsigned. Your project will be launched in local logging simulation mode. Sign in via the navigation hub to deploy active live cards.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-text-primary hover:bg-accent text-bg hover:text-bg font-extrabold text-xs uppercase tracking-widest py-4 px-6 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Configuring Workspace...</span>
                </>
              ) : (
                <>
                  <Rocket className="h-4.5 w-4.5" />
                  <span>Launch Project Card</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side Live Mock Preview Pane */}
        <div className="w-full lg:w-96 flex flex-col">
          <div className="glass-panel p-4 border border-border flex items-center gap-2 mb-4 bg-surface/30">
            <Terminal className="h-4 w-4 text-accent" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted">
              Live Project Card Preview
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-border bg-surface/10 rounded-sm relative">
            
            {/* Visual Simulated Project Card */}
            <div className="w-full glass-panel p-6 border border-border relative overflow-hidden transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-syne text-xl font-bold tracking-tight text-text-primary truncate max-w-[180px]">
                    {projectName || "YourProjectName"}
                  </h3>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider font-light">
                    Built by @{user ? (user.user_metadata?.user_name || "you") : "stranger"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-semibold border border-border text-text-muted">
                  Watchers: 0
                </div>
              </div>

              <p className="text-xs text-text-primary/95 line-clamp-3 leading-relaxed mb-4">
                {description || "Provide details on the left. The live inspector displays dynamic design token mappings instantly."}
              </p>

              {/* Purpose */}
              {purpose && (
                <div className="mb-4">
                  <span className="block text-[9px] uppercase tracking-widest text-text-muted mb-1 font-bold">Purpose</span>
                  <p className="text-[11px] text-text-primary/90">{purpose}</p>
                </div>
              )}

              {/* Stack Tags */}
              <div className="mb-4">
                <span className="block text-[9px] uppercase tracking-widest text-text-muted mb-1.5 font-bold">
                  Stack Required
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {stackTags.length === 0 ? (
                    <span className="bg-surface2 text-text-dim border border-border px-2 py-0.5 text-[10px]">
                      empty
                    </span>
                  ) : (
                    stackTags.map(tag => (
                      <span key={tag} className="bg-surface2 text-text-primary border border-border px-2 py-0.5 text-[10px]">
                        {tag}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Open Roles */}
              <div className="mb-5">
                <span className="block text-[9px] uppercase tracking-widest text-accent2 mb-1.5 font-bold">
                  Open Roles Needed
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {openRoles.length === 0 ? (
                    <span className="border border-border text-text-dim px-2 py-0.5 text-[10px]">
                      empty
                    </span>
                  ) : (
                    openRoles.map(role => (
                      <span key={role} className="border border-accent2/25 bg-accent2/5 text-accent2 px-2 py-0.5 text-[10px]">
                        {role}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Current Problem Hook */}
              {currentProblem && (
                <div className="bg-surface p-3.5 border-l-2 border-accent text-xs">
                  <div className="flex items-center gap-1.5 text-accent font-semibold uppercase tracking-wider text-[10px] mb-1">
                    <span>Problem Hook</span>
                  </div>
                  <p className="text-text-muted leading-relaxed italic text-[11px]">
                    "{currentProblem}"
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
