"use client";

import { useState, useCallback, useMemo } from "react";
import { parseFlossCross } from "@/lib/parser";
import { Tracker } from "@/components/tracker";

import samplePattern from "../public/example.json";

export default function TestPage() {
  const pattern = useMemo(() => parseFlossCross(samplePattern), []);

  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());

  const handleToggle = useCallback((key: string) => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleMarkAll = useCallback((key: string, done: boolean) => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (done) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Tracker
        pattern={pattern}
        doneSet={doneSet}
        onToggle={handleToggle}
        onMarkAll={handleMarkAll}
        saveStatus="idle"
      />
    </div>
  );
}
