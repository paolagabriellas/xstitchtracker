"use client";

import { useMemo } from "react";
import { parseFlossCross } from "@/lib/parser";
import { Tracker } from "@/components/tracker";
import { useDoneSet } from "@/hooks/useDoneSet";
import { useDebouncedSave } from "@/hooks/useDebouncedSave";

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
  const pattern = useMemo(() => parseFlossCross(rawPattern), [rawPattern]);
  const { doneSet, toggle, markAll } = useDoneSet(initialDoneKeys);
  const saveStatus = useDebouncedSave(projectId, doneSet);

  return (
    <Tracker
      pattern={pattern}
      doneSet={doneSet}
      onToggle={toggle}
      onMarkAll={markAll}
      saveStatus={saveStatus}
    />
  );
}