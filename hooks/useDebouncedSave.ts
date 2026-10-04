"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useDebouncedSave(
  projectId: string,
  doneSet: Set<string>
) {
  const SAVE_DEBOUNCE_MS = 2000; // debounce time in milliseconds
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const lastSavedAt = useRef(new Date());
  
  useEffect(() => {
    // skip the initial render — don't save what we just loaded
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // clear any pending save
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setStatus("saving");
      
      try {
        const supabase = createClient();
        const { data: current } = await supabase
          .from("projects")
          .select("updated_at")
          .eq("id", projectId)
          .single();

          if (current && new Date(current.updated_at) > lastSavedAt.current) {
            // If the server has a more recent update, we should not overwrite it.
            console.warn("Local changes not saved because the server has a more recent update.");
            setStatus("error");
            return;
          }
        const { error } = await supabase
          .from("projects")
          .update({
            done_keys: [...doneSet],
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId);

        if (error) throw error;
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch {
        setStatus("error");
        // retry once after 3 seconds
        try {
          localStorage.setItem(`xstitch-fallback-${projectId}`, JSON.stringify([...doneSet]));
        }
        catch {}
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
    };
  }, [doneSet, projectId]);

  return status;
}