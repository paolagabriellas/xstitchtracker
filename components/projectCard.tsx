"use client";

import { useState } from "react";
import Link from "next/link";
import { DeleteDialog } from "./deleteDialog";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    width: number;
    height: number;
    done_keys: string[];
    updated_at: string;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const totalStitches = project.width * project.height;
  // this is approximate — not all cells have stitches.
  // for exact count you'd need pattern_data, but for a dashboard card this is fine
  const doneCount = project.done_keys.length;

  return (
    <div className="bg-parch border border-border rounded-xl p-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <Link
          href={`/project/${project.id}`}
          className="font-medium hover:text-accent"
        >
          {project.title}
        </Link>
        <p className="text-xs text-ink-3 mt-1">
          {project.width} × {project.height} · {doneCount} stitches done ·
          last worked {new Date(project.updated_at).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => setShowDelete(true)}
        className="text-sm text-ink-3 hover:text-red-600"
      >
        Delete
      </button>
      {showDelete && (
        <DeleteDialog
          projectId={project.id}
          title={project.title}
          onClose={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}