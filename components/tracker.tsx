import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Pattern } from "@/lib/types";
import { GridTab } from "./gridTab";
import { ColorsTab } from "./colorsTab";
import { GuideTab } from "./guideTab";

interface TrackerProps {
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
  saveStatus,
}: TrackerProps) {
  const [tab, setTab] = useState<"grid" | "colors" | "guide">("grid");

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
    <div className="flex-1 flex flex-col min-h-0">
      {/* <a href="/dashboard" className="text-sm text-ink-3 hover:text-ink mb-1 inline-block shrink-0">
        ← Back to patterns
      </a>
      <div
        className="flex items-baseline gap-3.5 pb-1.5 border-b border-border mb-1.5 flex-wrap shrink-0"
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
          <div className="flex items-baseline gap-3.5 pb-2 border-b border-border mb-2 flex-wrap shrink-0">
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
          <span className="text-xs text-moss">✓ saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-xs text-danger">save failed — retrying</span>
        )}
      </div> */}
      {/* stats */}
      <div className="flex gap-2 mb-1.5 flex-wrap shrink-0">
        {[
          { val: stats.total.toLocaleString(), label: "total stitches" },
          { val: stats.done.toLocaleString(), label: "completed" },
          { val: stats.pct + "%", label: "progress" },
          { val: stats.colors, label: "colors" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-parch border border-border rounded-lg px-3 py-1.5 flex-1 min-w-[70px]"
          >
            <div className="font-serif text-base">{s.val}</div>
            <div className="text-[10px] text-ink-3">{s.label}</div>
          </div>
        ))}
      </div>

      {/* progress bar */}
      <div className="h-1 bg-linen-3 rounded-full mb-1.5 overflow-hidden shrink-0">
        <div
          className="h-full bg-accent rounded-full transition-[width] duration-400"
          style={{ width: stats.pct + "%" }}
        />
      </div>

      {/* tabs */}
      <div className="flex border-b border-border mb-2 shrink-0">
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
        <div className="flex-1" />
  {saveStatus === "saving" && <span className="text-[11px] text-ink-3 self-center">saving...</span>}
  {saveStatus === "saved" && <span className="text-[11px] text-moss self-center">✓ saved</span>}
  {saveStatus === "error" && <span className="text-[11px] text-danger self-center">save failed</span>}
      </div>
      {/* tab content */}
      <div className="flex-1 min-h-0 flex flex-col">
      {tab === "grid" && (
        <div className="flex-1 min-h-0 pb-4 flex flex-col">
          <GridTab pattern={pattern} doneSet={doneSet} onToggle={onToggle} />
          <p className="text-[11px] text-ink-3 mt-2 shrink-0">
            Click any stitch to mark it done. Grid lines every 10 cells.
          </p>
        </div>
      )}
      {tab === "colors" && (
        <div className="flex-1 min-h-0 overflow-auto">
          <ColorsTab pattern={pattern} doneSet={doneSet} />
        </div>
      )}
      {tab === "guide" && (
        <div className="flex-1 min-h-0 flex flex-col pb-4 overflow-y-auto">
        <GuideTab
          pattern={pattern}
          doneSet={doneSet}
          onToggle={onToggle}
          onMarkAll={onMarkAll}
        />
        </div>
      )}
      </div>
      
    </div>
  );
}
