import { Metadata } from "next";
import { supabase } from "@/utils/supabaseClient";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { data } = await supabase
      .from("projects")
      .select("name, description")
      .eq("id", id)
      .single();

    if (data) {
      return {
        title: `${data.name} — Leenout Collaborative Studio`,
        description: data.description || "A public collaborative coding workspace on Leenout.",
      };
    }
  } catch (err) {
    // Fail silently without leaking database traces
  }

  return {
    title: "Leenout Studio — Collaborative Workspace",
    description: "Build and pair program in real-time with developers worldwide.",
  };
}

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
