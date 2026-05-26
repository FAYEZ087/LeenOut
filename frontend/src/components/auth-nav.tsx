"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import { LogOut, User, Loader2 } from "lucide-react";

interface Profile {
  username: string;
  avatar_url: string;
}

export default function AuthNav() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();
      
      if (data && !error) {
        setProfile(data);
      }
    } catch (e) {
      console.error("Failed to fetch user profile:", e);
    }
  };

  useEffect(() => {
    // 1. Check Initial Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-accent" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 animate-fade-in">
        {/* User Profile Chip */}
        <Link 
          href="/profile"
          className="flex items-center gap-2.5 bg-surface hover:bg-surface2 border border-border hover:border-accent px-3 py-1.5 transition-all rounded-none cursor-pointer group"
        >
          <img 
            src={profile?.avatar_url || "https://api.dicebear.com/7.x/bottts/svg?seed=fallback"} 
            alt={profile?.username || "developer"} 
            className="h-5 w-5 border border-border bg-surface2 p-0.5 rounded-none group-hover:scale-105 transition-transform"
          />
          <span className="font-mono text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
            @{profile?.username || "developer"}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Link 
      href="/login" 
      className="border border-border hover:border-accent hover:text-accent px-4 py-1.5 transition-all text-xs font-semibold uppercase tracking-wider"
    >
      Enter
    </Link>
  );
}
