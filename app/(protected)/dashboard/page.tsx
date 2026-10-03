import { createClient } from "@/lib/supabase/server";
import { ProjectCard } from "@/components/projectCard";
import { UploadZone } from "@/components/uploadZone";

export default async function DashboardPage() {

  const MAX_PROJECTS = 3; // maximum number of projects a user can have
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, width, height, done_keys, created_at, updated_at")
    .order("updated_at", { ascending: false });

  // note: don't select pattern_data here — it's huge and not needed for the list

  const projectList = projects ?? [];
  const atLimit = projectList.length >= MAX_PROJECTS;

  return (
    <div>
      <h1 className="font-serif text-2xl mb-6">Your patterns</h1>

      <div className="flex flex-col gap-4 mb-8">
        {projectList.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {projectList.length === 0 && (
        <p className="text-ink-3 text-sm mb-6">
          No patterns yet. Upload a FlossCross JSON to get started.
        </p>
      )}

      {atLimit ? (
        <p className="text-sm text-ink-3">
          You've reached the {MAX_PROJECTS}-pattern limit.
          Delete one to upload a new pattern.
        </p>
      ) : (
        <UploadZone currentCount={projectList.length} />
      )}
    </div>
  );
}