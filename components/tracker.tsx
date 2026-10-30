import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Pattern } from "@/lib/types";
import { GridTab } from "./gridTab";
import { ColorsTab } from "./colorsTab";
import { GuideTab } from "./guideTab";
import { createClient } from "@/lib/supabase/client";

interface TrackerProps {
  projectId: string;
  title: string;
  pattern: Pattern;
  doneSet: Set<string>;
  onToggle: (key: string) => void;
  onMarkAll: (key: string, done: boolean) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export function Tracker({
  pattern,
  doneSet,
  onToggle,
  onMarkAll,
  title: initialTitle,
  projectId,
  saveStatus,
}: TrackerProps) {
  const [tab, setTab] = useState<"grid" | "colors" | "guide">("grid");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  const saveTitle = async (newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed || trimmed === pattern.title) {
      setEditing(false);
      return;
    }
    setTitle(trimmed);
    setEditing(false);

    const supabase = createClient();
    await supabase.from("projects").update({ title: trimmed }).eq("id", projectId);
  }


  const stats = useMemo(() => {
    const total = pattern.stitches.length;
    const done = pattern.stitches.filter((s) =>
      doneSet.has(`${s.row},${s.col}`),
    ).length;
    return {
      total,
      done,
      pct: total ? Math.round((done / total) * 100) : 0,
      colors: Object.keys(pattern.colors).length,
    };
  }, [pattern, doneSet]);

  return (
    <div>
      <a href="/dashboard" className="text-sm text-ink-3 hover:text-ink mb-4 inline-block">
        ← Back to patterns
      </a>
      <div
        className="flex items-baseline gap-3.5 pb-3.5 border-b border-border
                mb-4 flex-wrap"
      >
        {editing ? (
          <input
            autoFocus
            defaultValue={title}
            className="font-serif text-[22px] text-ink flex-1 min-w-0
             bg-transparent border-b border-accent outline-none"
            onBlur={(e) => saveTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle(e.currentTarget.value);
              if (e.key === "Escape") setEditing(false);
            }}
          />
        ) : (
          <div className="flex items-baseline gap-2 flex-1 min-w-0">
            <h1 className="font-serif text-[22px] text-ink truncate">
              {title}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="text-ink-3 hover:text-accent shrink-0"
              title="Rename project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </div>
        )}
        <span className="text-xs text-ink-3 whitespace-nowrap">
          {pattern.width} × {pattern.height}
        </span>
        {saveStatus === "saving" && (
          <span className="text-xs text-ink-3">saving...</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-xs text-green-700">✓ saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-red-600">save failed — retrying</span>
        )}
      </div>
      {/* stats */}
      <div className="flex gap-2.5 mb-4 flex-wrap">
        {[
          { val: stats.total.toLocaleString(), label: "total stitches" },
          { val: stats.done.toLocaleString(), label: "completed" },
          { val: stats.pct + "%", label: "progress" },
          { val: stats.colors, label: "colors" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-parch border border-border rounded-[10px] px-4 py-2.5
                      flex-1 min-w-[90px]"
          >
            <div className="font-serif text-[22px]">{s.val}</div>
            <div className="text-[11px] text-ink-3 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* progress bar */}
      <div className="h-[5px] bg-linen-3 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-400"
          style={{ width: stats.pct + "%" }}
        />
      </div>

      {/* tabs */}
      <div className="flex border-b border-border mb-5">
        {(["grid", "colors", "guide"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[13px] font-medium -mb-px border-b-2
                      cursor-pointer transition-colors
                      ${tab === t
                ? "text-accent border-accent"
                : "text-ink-3 border-transparent hover:text-ink"
              }`}
          >
            {t === "grid" ? "Grid" : t === "colors" ? "Colors" : "Row Guide"}
          </button>
        ))}
      </div>
      {/* tab content — add this block */}
      {tab === "grid" && (
        <>
          <GridTab pattern={pattern} doneSet={doneSet} onToggle={onToggle} />
          <p className="text-[11px] text-ink-3 mt-2">
            Click any stitch to mark it done. Grid lines every 10 cells.
          </p>
        </>
      )}
      {tab === "colors" && <ColorsTab pattern={pattern} doneSet={doneSet} />}
      {tab === "guide" && (
        <GuideTab
          pattern={pattern}
          doneSet={doneSet}
          onToggle={onToggle}
          onMarkAll={onMarkAll}
        />
      )}
    </div>
  );
}
