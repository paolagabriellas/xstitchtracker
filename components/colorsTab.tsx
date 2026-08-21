"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Pattern } from "@/lib/types";
import { dmcSortKey } from "../lib/parser";

interface ColorsTabProps {
  pattern: Pattern;
  doneSet: Set<string>;
}

interface ColorStats {
  total: number;
  done: number;
}

export function ColorsTab({ pattern, doneSet }: ColorsTabProps) {
  const stats = useMemo(() => {
    // s = per-color stitch count
    const s: Record<string, ColorStats> = {};
    pattern.stitches.forEach(({ row, col, colorIdx }) => {
      if (!s[colorIdx]) {
        s[colorIdx] = { total: 0, done: 0 };
      }
      s[colorIdx].total++;
      if (doneSet.has(`${row},${col}`)) {
        s[colorIdx].done++;
      }
    });
    return s;
  }, [pattern, doneSet]);

  const sorted = Object.entries(pattern.colors)
    .filter(([idx]) => stats[idx])
    .sort((a, b) => dmcSortKey(a[1].dmc).localeCompare(dmcSortKey(b[1].dmc)));

  return (
    <div className="flex flex-col gap-2 overflow-auto max-h-[calc(100vh-280px)]">
      {sorted.map(([idx, color]) => {
        const s: ColorStats = stats[idx] || { total: 0, done: 0 };
        const pct = s.total ? Math.round((s.done / s.total) * 100) : 0;
        return (
          //swatch
          <div
            key={idx}
            className="flex items-center gap-3 bg-parch border border-border rounded-[10px] px-3.5 py-2.5"
          >
            <div
              className="w-7 h-7 rounded-full border-[1.5px] border-black/12 shrink-0"
              style={{ background: color.hex }}
            />
            {/* color info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px] truncate">
                {color.name}
              </div>
              <div className="text-[11px] text-ink-3 font-mono">
                DMC {color.dmc}
              </div>
              {/* mini-progress */}
              <div className="h-[3px] bg-linen-3 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: pct + "%", background: color.hex }}
                />
              </div>
            </div>
            {/* count */}
            <div className="text-xs text-ink-3 text-right whitespace-nowrap">
              <strong className="block text-[15px] text-ink font-serif">
                {s.done}/{s.total}
              </strong>
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
