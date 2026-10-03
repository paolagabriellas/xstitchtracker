"use client";

import { useState, useCallback } from "react";

export function useDoneSet(initial: string[]) {
  const [doneSet, setDoneSet] = useState(() => new Set(initial));

  const toggle = useCallback((key: string) => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const markAll = useCallback((key: string, done: boolean) => {
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (done) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  return { doneSet, toggle, markAll, setDoneSet };
}