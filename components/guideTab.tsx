import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { dmcSortKey } from "../lib/parser";
import { Pattern, Stitch } from "@/lib/types";

interface GuideTabProps {
  pattern: Pattern;
  doneSet: Set<string>;
  onToggle: (key: string) => void;
  onMarkAll: (key: string, done: boolean) => void;
}

interface CoordProps {
  stitches: Stitch[];
  type: "previous" | "current" | "next";
  doneSet: Set<string>;
  onToggle: (key: string) => void;
}

function RenderCoords({ stitches, type, doneSet, onToggle }: CoordProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {stitches.map((s) => {
        const key = `${s.row},${s.col}`;
        const isDone = type === "previous" || doneSet.has(key);
        const isClickable = type === "current";

        return (
          <span
            key={key}
            onClick={isClickable ? () => onToggle(key) : undefined}
            className={`
              font-mono text-xs px-2 py-0.5 rounded border
              ${
                isDone
                  ? "border-border bg-linen-2 text-done line-through"
                  : "border-border bg-parch text-ink-2"
              }
              ${
                isClickable
                  ? "cursor-pointer hover:bg-linen-2"
                  : "cursor-default"
              }
            `}
          >
            {s.col + 1}
          </span>
        );
      })}
    </div>
  );
}

export function GuideTab({
  pattern,
  doneSet,
  onToggle,
  onMarkAll,
}: GuideTabProps) {
  const [selectedIdx, setSelectedIdx] = useState("");
  const [rowPtr, setRowPtr] = useState<Record<string, number>>({});
  const [hoopFrom, setHoopFrom] = useState(1);
  const [hoopTo, setHoopTo] = useState(pattern.width);

  const colorOptions = useMemo(() => {
    const used = new Set(pattern.stitches.map((s) => s.colorIdx));
    return Object.entries(pattern.colors)
      .filter(([idx]) => used.has(Number(idx)))
      .sort((a, b) => dmcSortKey(a[1].dmc).localeCompare(dmcSortKey(b[1].dmc)));
  }, [pattern]);

  const colFrom = Math.max(0, (hoopFrom || 1) - 1);
  const colTo = Math.min(pattern.width - 1, (hoopTo || pattern.width) - 1);

  const byRow = useMemo(() => {
    if (!selectedIdx) return {};

    const colorIdx = Number(selectedIdx);

    const stitchesInRange = pattern.stitches.filter(
      (s) => s.colorIdx === colorIdx && s.col >= colFrom && s.col <= colTo,
    );

    const grouped: Record<number, Stitch[]> = {};
    for (const stitch of stitchesInRange) {
      if (!grouped[stitch.row]) {
        grouped[stitch.row] = [];
      }
      grouped[stitch.row].push(stitch);
    }

    Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.col - b.col));

    return grouped;
  }, [pattern, selectedIdx, colFrom, colTo]);

  const rows = useMemo(
    () =>
      Object.keys(byRow)
        .map(Number)
        .sort((a, b) => a - b),
    [byRow],
  );

  const ptr = Math.min(rowPtr[selectedIdx] ?? 0, Math.max(0, rows.length - 1));

  const isFirstRow = ptr === 0;
  const isLastRow = ptr >= rows.length - 1;

  const curRow = rows[ptr];
  const prevRow = isFirstRow ? null : rows[ptr - 1];
  const nextRow = isLastRow ? null : rows[ptr + 1];

  function goToPreviousRow() {
    if (isFirstRow) return;
    setRowPtr((prev) => ({
      ...prev,
      [selectedIdx]: curRow - 1,
    }));
  }

  function goToNextRowAndMarkDone() {
    if (isLastRow) return;

    // mark every stitch in the current row as done before advancing
    const currentStitches = byRow[curRow] ?? [];
    currentStitches.forEach((s) => onMarkAll(`${s.row},${s.col}`, true));

    setRowPtr((prev) => ({
      ...prev,
      [selectedIdx]: curRow + 1,
    }));
  }

  const color = pattern.colors[Number(selectedIdx)];

  const totalStitches = rows.reduce(
    (sum, r) => sum + (byRow[r]?.length || 0),
    0,
  );

  const doneStitches = selectedIdx
    ? pattern.stitches.filter(
        (s) =>
          s.colorIdx === Number(selectedIdx) &&
          s.col >= colFrom &&
          s.col <= colTo &&
          doneSet.has(`${s.row},${s.col}`),
      ).length
    : 0;

  const allCurrentDone =
    curRow !== undefined &&
    byRow[curRow]?.every((s) => doneSet.has(`${s.row},${s.col}`));

  return (
    <div>
      {/* color selector */}
      <div className="flex gap-2.5 items-center mb-3 flex-wrap">
        <label className="text-[13px] text-ink-3 font-medium whitespace-nowrap">
          Thread color:
        </label>
        <select
          className="flex-1 min-w-[200px] px-3 py-2 border border-border rounded-lg
                   bg-parch text-ink font-sans text-[13px]"
          value={selectedIdx}
          onChange={(e) => {
            setSelectedIdx(e.target.value);
            setRowPtr({});
          }}
        >
          <option value="">— choose a color —</option>
          {colorOptions.map(([idx, c]) => (
            <option key={idx} value={idx}>
              {c.name} · DMC {c.dmc}
            </option>
          ))}
        </select>
      </div>

      {/* hoop range */}
      <div
        className="flex gap-2 items-center bg-parch border border-border
                    rounded-[10px] px-3.5 py-2.5 mb-3.5 flex-wrap"
      >
        <label className="text-xs text-ink-3 font-medium whitespace-nowrap">
          Hoop columns:
        </label>
        <input
          type="number"
          className="w-16 px-2 py-1.5 border border-border rounded-md
                   bg-linen font-mono text-[13px] text-center"
          min={1}
          max={pattern.width}
          value={hoopFrom}
          onChange={(e) => {
            setHoopFrom(Number(e.target.value) || 1);
            setRowPtr({});
          }}
        />
        <span className="text-[13px] text-ink-3">to</span>
        <input
          type="number"
          className="w-16 px-2 py-1.5 border border-border rounded-md
                   bg-linen font-mono text-[13px] text-center"
          min={1}
          max={pattern.width}
          value={hoopTo}
          onChange={(e) => {
            setHoopTo(Number(e.target.value) || pattern.width - 1);
            setRowPtr({});
          }}
        />
        <span className="text-[13px] text-ink-3">of {pattern.width}</span>
        <span className="text-[11px] text-ink-3 flex-1 min-w-full mt-0.5">
          Limit guide to columns currently in your hoop.
        </span>
      </div>

      {/* empty states */}
      {!selectedIdx ? (
        <div className="py-10 text-center text-ink-3 text-[13px] leading-relaxed">
          <span className="text-[30px] block mb-2">🪡</span>
          Select a thread color above.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center text-ink-3 text-[13px]">
          No stitches for this color in columns {colFrom + 1}–{colTo + 1}.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-380px)]">
          {/* panel header */}
          <div className="flex items-center gap-3 px-4 py-3.5 bg-linen-2 border-b border-border shrink-0">
            <div
              className="w-8 h-8 rounded-full border-[1.5px] border-black/12
                       shrink-0"
              style={{ background: color?.hex }}
            />
            <div className="flex-1">
              <div className="font-medium text-sm">
                {color?.name} · DMC {color?.dmc}
              </div>
              <div className="text-xs text-ink-3 mt-0.5">
                {doneStitches} of {totalStitches} done · {rows.length} rows
                {colFrom > 0 || colTo < pattern.width - 1
                  ? ` · cols ${colFrom + 1}–${colTo + 1}`
                  : ""}
              </div>
            </div>
          </div>

          {/* panel body */}
          <div className="p-4 flex flex-col gap-3 overflow-auto flex-1 min-h-0">
            {/* previous row */}
            {prevRow !== null && (
              <div
                className="rounded-[10px] px-3.5 py-3 bg-linen-2
                            border border-linen-3"
              >
                <div
                  className="text-[11px] font-medium text-ink-3 uppercase
                              tracking-wide mb-2"
                >
                  Previous · row {prevRow + 1}
                </div>
                <RenderCoords
                  stitches={byRow[prevRow]}
                  type="previous"
                  doneSet={doneSet}
                  onToggle={onToggle}
                />
              </div>
            )}

            {/* current row */}
            <div
              className="rounded-[10px] px-3.5 py-3 bg-parch
                          border border-accent"
            >
              <div
                className="text-[11px] font-medium text-ink-3 uppercase
                            tracking-wide mb-2 flex items-center gap-2"
              >
                Current · row {curRow + 1}
                {allCurrentDone ? (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full
                                 bg-green-100 text-green-700 font-medium"
                  >
                    all done ✓
                  </span>
                ) : (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full
                                 bg-amber-100 text-amber-700 font-medium"
                  >
                    in progress
                  </span>
                )}
              </div>

              <RenderCoords
                stitches={byRow[curRow]}
                type="current"
                doneSet={doneSet}
                onToggle={onToggle}
              />

              {/* mark all / unmark all */}
              <div className="mt-2.5">
                <button
                  className="text-xs px-3 py-1 border border-border rounded-lg
                           bg-parch hover:bg-linen-2"
                  onClick={() => {
                    const currentStitches = byRow[curRow] ?? [];
                    if (allCurrentDone) {
                      currentStitches.forEach((s) =>
                        onMarkAll(`${s.row},${s.col}`, false),
                      );
                    } else {
                      currentStitches.forEach((s) =>
                        onMarkAll(`${s.row},${s.col}`, true),
                      );
                    }
                  }}
                >
                  {allCurrentDone ? "Unmark all" : "Mark all done"}
                </button>
              </div>
            </div>

            {/* up next row */}
            {nextRow !== null && (
              <div
                className="rounded-[10px] px-3.5 py-3 bg-linen-2
                            border border-linen-3"
              >
                <div
                  className="text-[11px] font-medium text-ink-3 uppercase
                              tracking-wide mb-2"
                >
                  Up next · row {nextRow + 1}
                </div>

                <RenderCoords
                  stitches={byRow[nextRow]}
                  type="next"
                  doneSet={doneSet}
                  onToggle={onToggle}
                />
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-border shrink-0">
            {/* navigation */}
            <div className="flex gap-2 items-center">
              <button
                onClick={goToPreviousRow}
                disabled={isFirstRow}
                className="text-[13px] font-medium px-4 py-1.5 border
                         border-border rounded-lg bg-parch hover:bg-linen-2
                         disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="flex-1 text-center text-xs text-ink-3">
                row {curRow + 1} of {rows.length}
              </span>
              <button
                onClick={goToNextRowAndMarkDone}
                disabled={isLastRow}
                className="text-[13px] font-medium px-4 py-1.5 rounded-lg
                         bg-accent text-white border border-accent
                         hover:bg-[#7a5234] disabled:opacity-40
                         disabled:cursor-not-allowed"
              >
                Next & mark done →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
