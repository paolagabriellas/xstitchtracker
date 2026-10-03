import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { parseFlossCross } from "@/lib/parser";
import { ProjectTracker } from "./projectTracker";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !project) notFound();

  return (
    <ProjectTracker
      projectId={project.id}
      rawPattern={project.pattern_data}
      initialDoneKeys={project.done_keys}
    />
  );
}