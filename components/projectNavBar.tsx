"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProjectNavBarProps {
    projectId: string;
    projectTitle: string;
    width: number;
    height: number;
}

export function ProjectNavBar({
    projectId,
    projectTitle,
    width,
    height,
}: ProjectNavBarProps) {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(projectTitle);

    const saveTitle = async (newTitle: string) => {
        const trimmed = newTitle.trim();
        if (!trimmed || trimmed === title) {
            setEditing(false);
            return;
        }
        setTitle(trimmed);
        setEditing(false);
        const supabase = createClient();
        await supabase.from("projects").update({ title: trimmed }).eq("id", projectId);
    };

    return (
        <nav className="border-b border-border px-4 py-2 flex items-center gap-3 shrink-0">
            {/* <a href="/dashboard" className="text-ink-3 hover:text-ink text-sm">←</a>

            <span className="text-sm text-ink-3 whitespace-nowrap">Back</span> */}

            <a href="/dashboard" className="font-serif text-base text-ink whitespace-nowrap">
                XStitchTracker
            </a>

            <span className="text-ink-3">/</span>
            {editing ? (
                <input
                    autoFocus
                    defaultValue={title}
                    className="font-serif text-sm text-ink bg-transparent border-b border-accent outline-none min-w-[120px]"
                    onBlur={(e) => saveTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") saveTitle(e.currentTarget.value);
                        if (e.key === "Escape") setEditing(false);
                    }}
                />
            ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-serif text-sm text-accent truncate">{title}</span>
                    <button
                        onClick={() => setEditing(true)}
                        className="text-ink-3 hover:text-accent shrink-0"
                        title="Rename project"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                        </svg>
                    </button>
                </div>
            )}

            <span className="text-[11px] text-ink-3 whitespace-nowrap">{width}×{height}</span>

            <div className="flex-1" />

            <form action="/auth/signout" method="post">
                <button type="submit" className="text-sm text-ink-3 hover:text-ink">Sign out</button>
            </form>
        </nav>
    );
}