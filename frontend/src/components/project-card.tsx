"use client";

import React, { useState, useEffect } from "react";
import { Eye, Users, Layers, AlertCircle, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

export interface Project {
  id: string;
  name: string;
  description: string;
  purpose: string;
  stack_tags: string[];
  open_roles: string[];
  current_problem?: string;
  owner_id: string;
  owner_username?: string;
  watch_count?: number;
  contribution_count?: number;
}

interface ProjectCardProps {
  project: Project;
  onRequestAccess: (project: Project) => void;
  currentUserId?: string;
  userTags?: string[];
  initialIsWatched?: boolean;
}

export default function ProjectCard({ 
  project, 
  onRequestAccess, 
  currentUserId, 
  userTags = [], 
  initialIsWatched = false 
}: ProjectCardProps) {
  const [watched, setWatched] = useState(initialIsWatched);
  const [watchCount, setWatchCount] = useState(project.watch_count || 0);

  // Sync initial watch status if it changes
  useEffect(() => {
    setWatched(initialIsWatched);
  }, [initialIsWatched]);

  // Sync initial watch count
  useEffect(() => {
    setWatchCount(project.watch_count || 0);
  }, [project.watch_count]);

  const toggleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) {
      alert("Please sign in to watch this project.");
      return;
    }

    try {
      if (watched) {
        // Delete watcher row
        const { error } = await supabase
          .from("project_watchers")
          .delete()
          .eq("project_id", project.id)
          .eq("user_id", currentUserId);

        if (error) throw error;
        setWatchCount(prev => Math.max(0, prev - 1));
        setWatched(false);
      } else {
        // Insert watcher row
        const { error } = await supabase
          .from("project_watchers")
          .insert({
            project_id: project.id,
            user_id: currentUserId
          });

        if (error) throw error;
        setWatchCount(prev => prev + 1);
        setWatched(true);
      }
    } catch (err: any) {
      console.warn("Failed to toggle project watch state:", err.message);
    }
  };

  // Stack tag matching calculation
  const matchingTags = project.stack_tags.filter(tag => 
    userTags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
  const matchCount = matchingTags.length;
  const matchPercentage = project.stack_tags.length > 0 
    ? (matchCount / project.stack_tags.length) * 100 
    : 0;
  const isHighRelevance = matchPercentage >= 50 && project.stack_tags.length > 0;

  return (
    <div 
      className={`glass-panel glass-panel-hover p-6 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 ${
        isHighRelevance 
          ? "border-accent/40 shadow-[0_0_15px_rgba(203,214,55,0.08)] bg-accent/[0.01]" 
          : "border-border"
      }`}
    >
      {/* Top glowing visual bar on hover / high relevance */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent/0 via-accent to-accent/0 transition-opacity ${
          isHighRelevance ? "opacity-60" : "opacity-0 hover:opacity-100"
        }`} 
      />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-syne text-xl font-bold tracking-tight text-text-primary">
                {project.name}
              </h3>
              {/* Relevance indicator pill */}
              {matchCount > 0 && (
                <span className="flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-sm">
                  ● {matchCount} {matchCount === 1 ? "match" : "matches"}
                </span>
              )}
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider font-light">
              Built by @{project.owner_username || "anonymous"}
            </span>
          </div>

          <button
            onClick={toggleWatch}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-semibold border transition-all cursor-pointer ${
              watched 
                ? "bg-accent/10 border-accent text-accent" 
                : "border-border text-text-muted hover:border-text-primary hover:text-text-primary"
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>{watchCount}</span>
          </button>
        </div>

        {/* Short Description */}
        <p className="text-xs text-text-primary/95 line-clamp-2 leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Stack Tags */}
        <div className="mb-4">
          <span className="block text-[9px] uppercase tracking-widest text-text-muted mb-1.5 font-bold">
            Stack Required
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.stack_tags.map(tag => {
              const isMatched = userTags.some(t => t.toLowerCase() === tag.toLowerCase());
              return (
                <span 
                  key={tag} 
                  className={`border px-2 py-0.5 text-[10px] ${
                    isMatched 
                      ? "bg-accent/15 border-accent text-accent font-medium" 
                      : "bg-surface2 border-border text-text-primary"
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Open Roles */}
        <div className="mb-5">
          <span className="block text-[9px] uppercase tracking-widest text-accent2 mb-1.5 font-bold">
            Open Roles Needed
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.open_roles.map(role => (
              <span 
                key={role} 
                className="border border-accent2/25 bg-accent2/5 text-accent2 px-2 py-0.5 text-[10px]"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Current Problem Hook */}
        {project.current_problem && (
          <div className="bg-surface p-3.5 border-l-2 border-accent mb-6 text-xs">
            <div className="flex items-center gap-1.5 text-accent font-semibold uppercase tracking-wider text-[10px] mb-1">
              <AlertCircle className="h-3 w-3" />
              <span>Current Problem</span>
            </div>
            <p className="text-text-muted leading-relaxed italic text-[11px]">
              "{project.current_problem}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3.5 text-[11px] text-text-muted">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-accent" />
            <span>{project.contribution_count || 0} active</span>
          </div>
        </div>

        <button
          onClick={() => onRequestAccess(project)}
          className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-accent hover:text-text-primary transition-colors cursor-pointer group"
        >
          <span>Request Collaboration</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
