import { Metadata } from "next";
import { supabase } from "@/utils/supabaseClient";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { username } = await params;
  
  try {
    const { data } = await supabase
      .from("profiles")
      .select("username, stack_tags")
      .eq("username", username)
      .single();

    if (data) {
      const skills = data.stack_tags && data.stack_tags.length > 0
        ? ` specializing in ${data.stack_tags.join(", ")}`
        : "";
      return {
        title: `@${data.username} — Leenout Developer Profile`,
        description: `Explore the developer profile card and active collaborations of @${data.username}${skills} on Leenout.`,
      };
    }
  } catch (err) {
    // Fail silently without leaking database traces
  }

  return {
    title: "Developer Card — Leenout",
    description: "Browse public developer profiles and active collaboration rosters on Leenout.",
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
