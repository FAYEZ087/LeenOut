"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import AuthNav from "@/components/auth-nav";
import { Search, Menu, X } from "lucide-react";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  // Strictly Dark Theme Enforced
  
  // Check if we are inside the studio workspace route (/project/[id])
  const isStudio = pathname?.includes("/project/");
  const isSupport = pathname === "/support";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = userSearch.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername) {
      setUserSearch("");
      router.push(`/profile/${cleanUsername}`);
    }
  };

  if (isStudio) {
    return (
      <body className="h-screen bg-bg text-text-primary font-mono flex flex-col selection:bg-accent selection:text-bg overflow-hidden">
        {/* Core Main Area - fills 100% of the screen without outer scrollbars */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </body>
    );
  }

  return (
    <body className="min-h-screen bg-bg text-text-primary font-mono flex flex-col selection:bg-accent selection:text-bg">
      
      {/* Navigation Bar */}
      <header className="border-b border-border bg-bg/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8 md:gap-12 flex-1">
            <Link 
              href="/" 
              className="font-syne text-2xl font-extrabold tracking-tighter text-text-primary hover:opacity-90 transition-opacity shrink-0"
            >
              Leen<span className="text-accent font-extrabold">out</span>
            </Link>

            {/* User Search Bar in Header Navbar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-[140px] xs:max-w-xs md:max-w-sm">
              <input
                type="text"
                placeholder="Search user profile..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-surface border border-border text-text-primary pl-9 pr-3 py-1.5 text-xs focus:border-accent focus:outline-none transition-all font-mono rounded-none"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
            </form>

            <nav className="hidden lg:flex items-center gap-8 text-sm shrink-0">
              <Link href="/" className="text-text-primary hover:text-accent transition-colors font-medium">
                Explore
              </Link>
              <Link href="/create" className="text-text-primary hover:text-accent transition-colors font-medium">
                Create Project
              </Link>
              <Link href="/dashboard" className="text-text-primary hover:text-accent transition-colors font-medium">
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 shrink-0 pl-4">


            <AuthNav />
            
            {/* Mobile Navigation Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-1.5 hover:text-accent text-text-primary transition-colors bg-transparent border border-border hover:border-accent cursor-pointer flex items-center justify-center rounded-none shrink-0"
              aria-label="Toggle Mobile Menu"
            >
              {menuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown Menu */}
      {menuOpen && (
        <div className="lg:hidden border-b border-border bg-bg/95 backdrop-blur-md sticky top-18 left-0 right-0 z-40 transition-all duration-300 animate-fade-in select-none">
          <nav className="flex flex-col p-6 space-y-4 text-xs font-mono tracking-wider uppercase font-semibold">
            <Link 
              href="/" 
              onClick={() => setMenuOpen(false)}
              className="text-text-primary hover:text-accent transition-colors py-2 border-b border-border/40 flex items-center justify-between"
            >
              <span>Explore Workspaces</span>
              <span className="text-[9px] text-text-muted">[feed]</span>
            </Link>
            <Link 
              href="/create" 
              onClick={() => setMenuOpen(false)}
              className="text-text-primary hover:text-accent transition-colors py-2 border-b border-border/40 flex items-center justify-between"
            >
              <span>Launch Project</span>
              <span className="text-[9px] text-text-muted">[create]</span>
            </Link>
            <Link 
              href="/dashboard" 
              onClick={() => setMenuOpen(false)}
              className="text-text-primary hover:text-accent transition-colors py-2 border-b border-border/40 flex items-center justify-between"
            >
              <span>Developer Dashboard</span>
              <span className="text-[9px] text-text-muted">[logs]</span>
            </Link>
          </nav>
        </div>
      )}


      {/* Core Main Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      {!isSupport && (
        <footer className="border-t border-border bg-[#0a0a0a] py-16 px-6 font-mono select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="font-syne text-xl font-extrabold tracking-tighter text-text-primary">
              Leen<span className="text-accent font-extrabold">out</span>
            </Link>
            <p className="text-[11px] text-text-muted leading-relaxed font-light max-w-xs">
              A public marketplace where developers lean out of their windows, discover active codebases, and collaborate pair-programming style under owner-gated slots.
            </p>
          </div>

          {/* Platform Column */}
          <div className="space-y-3">
            <h4 className="font-syne text-[10px] font-bold uppercase tracking-widest text-text-muted">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-text-muted hover:text-accent transition-colors font-light">Explore Workspaces</Link>
              </li>
              <li>
                <Link href="/create" className="text-text-muted hover:text-accent transition-colors font-light">Launch Workspace</Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-text-muted hover:text-accent transition-colors font-light">Developer Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Developer Column */}
          <div className="space-y-3">
            <h4 className="font-syne text-[10px] font-bold uppercase tracking-widest text-text-muted">Developer tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/profile" className="text-text-muted hover:text-accent transition-colors font-light">My Profile Card</Link>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors font-light">GitHub Sync</a>
              </li>
              <li>
                <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-text-muted hover:text-accent transition-colors font-light">PostgreSQL Database</a>
              </li>
            </ul>
          </div>

          {/* Trust & Support Column */}
          <div className="space-y-3">
            <h4 className="font-syne text-[10px] font-bold uppercase tracking-widest text-text-muted">Trust & Support</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/legals/security" className="text-text-muted hover:text-accent transition-colors font-light">Security Policy</Link>
              </li>
              <li>
                <Link href="/legals/privacy" className="text-text-muted hover:text-accent transition-colors font-light">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/legals/terms" className="text-text-muted hover:text-accent transition-colors font-light">Terms of Service</Link>
              </li>
              <li>
                <Link href="/legals/disclaimer" className="text-text-muted hover:text-accent transition-colors font-light">Disclaimer</Link>
              </li>
              <li>
                <Link href="/legals/developer-api" className="text-text-muted hover:text-accent transition-colors font-light">Developer API</Link>
              </li>
              <li>
                <Link href="/support" className="text-text-muted hover:text-accent transition-colors font-light">Support & Help</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright ribbon */}
        <div className="max-w-7xl mx-auto border-t border-border/40 pt-8 flex justify-center items-center">
          <div className="text-xs text-text-muted font-light">
            &copy; {new Date().getFullYear()} Leenout, Inc. All rights reserved. 
          </div>
        </div>
      </footer>
      )}
    </body>
  );
}
