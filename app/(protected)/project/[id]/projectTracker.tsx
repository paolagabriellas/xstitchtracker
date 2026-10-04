"use client";

import { useEffect, useMemo } from "react";
import { parseFlossCross } from "@/lib/parser";
import { Tracker } from "@/components/tracker";
import { useDoneSet } from "@/hooks/useDoneSet";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";
import { Toast } from "@/components/toast";

interface ProjectTrackerProps {
  projectId: string;
  rawPattern: any;
  initialDoneKeys: string[];
}

export function ProjectTracker({
  projectId,
  rawPattern,
  initialDoneKeys,
}: ProjectTrackerProps) {
  const pattern = useMemo(() => {
    try {
      return parseFlossCross(rawPattern);
    } catch (error) {
      console.error("Error parsing FlossCross pattern:", error);
      return null;
    }
  }, [rawPattern]);

  const { doneSet, toggle, markAll, setDoneSet } = useDoneSet(initialDoneKeys);
  const saveStatus = useDebouncedSave(projectId, doneSet);

  useEffect(() => {
    try {
      const fallbackData = localStorage.getItem(`xstitch-fallback-${projectId}`);
      if (fallbackData) {
        const keys = JSON.parse(fallbackData) as string[];
        if (keys.length > doneSet.size) {
          setDoneSet(new Set(keys));
        }
        localStorage.removeItem(`xstitch-fallback-${projectId}`);
      }
    } catch {}
  }, []);

  if (!pattern) {
    return (
      <div className="py-20 text-center">
      <p className="text-lg mb-2">Something went wrong</p>
      <p className="text-sm text-ink-3 mb-4">
        This pattern's data couldn't be loaded. It may be corrupted.
      </p>
      <a href="/dashboard" className="text-sm text-accent hover:underline">
        ← Back to patterns
      </a>
    </div>
    );
  }

  return (
    <>
    <Tracker
      pattern={pattern}
      doneSet={doneSet}
      onToggle={toggle}
      onMarkAll={markAll}
      saveStatus={saveStatus}
    />
    <Toast
    message="Save failed. Retrying..."
    type="error"
    visible={saveStatus === "error"}
  />  
  </>
  );
}