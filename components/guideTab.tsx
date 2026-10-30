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
  type: "current" | "other";
  doneSet: Set<string>;
  onToggle: (key: string) => void;
}

function RenderCoords({ stitches, type, doneSet, onToggle }: CoordProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {stitches.map((s) => {
        const key = `${s.row},${s.col}`;
        const isDone = doneSet.has(key);
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

  const listRef = useRef<HTMLDivElement | null>(null);
  const curRowRef = useRef<HTMLDivElement | null>(null);

  // keep the current row centered in the list
  useEffect(() => {
    const list = listRef.current;
    const el = curRowRef.current;
    if (!list || !el) return;
    list.scrollTo({
      top: el.offsetTop - (list.clientHeight - el.offsetHeight) / 2,
      behavior: "smooth",
    });
  }, [selectedIdx, ptr, colFrom, colTo]);

  function goToPreviousRow() {
  if (isFirstRow) return;
  setRowPtr((prev) => ({
    ...prev,
    [selectedIdx]: ptr - 1,
  }));
}

function goToNextRowAndMarkDone() {
  if (isLastRow) return;
  const currentStitches = byRow[curRow] ?? [];
  currentStitches.forEach((s) => onMarkAll(`${s.row},${s.col}`, true));
  setRowPtr((prev) => ({
    ...prev,
    [selectedIdx]: ptr + 1,
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
    <div className="flex-1 min-h-0 flex flex-col">
      {/* color selector + hoop range */}
      <div className="flex gap-x-4 gap-y-2 items-center mb-2 flex-wrap shrink-0">
      <div className="flex gap-2 items-center flex-1 min-w-[240px]">
        <label className="text-xs text-ink-3 font-medium whitespace-nowrap">
          Thread color:
        </label>
        <select
          className="flex-1 min-w-0 px-2.5 py-1.5 border border-border rounded-lg
                   bg-parch text-ink font-sans text-[13px]"
          value={selectedIdx}
          onChange={(e) => {
            const newIdx = e.target.value;
            setSelectedIdx(newIdx);

            if (newIdx){
              const fi = Number(newIdx);
              const stitchesInRange = pattern.stitches.filter(
                (s) => s.colorIdx === fi && s.col >= colFrom && s.col <= colTo,
              );
              const grouped: Record<number, Stitch[]> = {};
              for (const s of stitchesInRange) {
                if (!grouped[s.row]) {
                  grouped[s.row] = [];
                }
                grouped[s.row].push(s);
              }
              const sortedRows = Object.keys(grouped)
                .map(Number)
                .sort((a, b) => a - b);
              
              const firstIncomplete = sortedRows.findIndex(
                (r) => !grouped[r].every((s) => doneSet.has(`${s.row},${s.col}`))
              );
              setRowPtr((prev) => ({
                ...prev,
                [newIdx]: firstIncomplete >= 0 ? firstIncomplete : sortedRows.length - 1,
              }));
            }
            else {
              setRowPtr({});
            }
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

      <div className="flex gap-2 items-center">
        <label className="text-xs text-ink-3 font-medium whitespace-nowrap">
          Hoop columns:
        </label>
        <span className="relative group inline-flex">
          <button
            type="button"
            aria-label="What are hoop columns?"
            className="w-4 h-4 rounded-full border border-ink-3 text-ink-3 text-[10px]
                     leading-none font-serif italic inline-flex items-center justify-center
                     hover:text-accent hover:border-accent focus:outline-none
                     focus-visible:text-accent focus-visible:border-accent"
          >
            i
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 z-10
                     w-56 rounded-md bg-ink text-parch text-[11px] leading-snug px-2.5 py-1.5
                     shadow-lg opacity-0 transition-opacity
                     group-hover:opacity-100 group-focus-within:opacity-100"
          >
            Limit the guide to the columns currently in your hoop.
          </span>
        </span>
        <input
          type="number"
          className="w-16 px-2 py-1 border border-border rounded-md
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
          className="w-16 px-2 py-1 border border-border rounded-md
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
      </div>
      </div>

      {/* empty states */}
      {!selectedIdx ? (
        <div className="flex-1 flex items-center justify-center text-ink-3 text-[13px]">
          <div className="text-center">
          <span className="text-[30px] block mb-2">🪡</span>
          Select a thread color above.
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-ink-3 text-[13px]">
          No stitches for this color in columns {colFrom + 1}–{colTo + 1}.
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden bg-parch flex flex-col flex-1 min-h-0">
          {/* panel header */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-linen-2 border-b border-border shrink-0">
            <div
              className="w-6 h-6 rounded-full border-[1.5px] border-black/12
                       shrink-0"
              style={{ background: color?.hex }}
            />
            <div className="flex-1 flex items-baseline gap-x-3 flex-wrap">
              <div className="font-medium text-sm">
                {color?.name} · DMC {color?.dmc}
              </div>
              <div className="text-xs text-ink-3">
                {doneStitches} of {totalStitches} done · {rows.length} rows
                {colFrom > 0 || colTo < pattern.width - 1
                  ? ` · cols ${colFrom + 1}–${colTo + 1}`
                  : ""}
              </div>
            </div>
          </div>

          {/* panel body: every row for this color, scrollable */}
          <div
            ref={listRef}
            className="relative p-2.5 flex flex-col gap-2 overflow-auto flex-1 min-h-[240px]"
          >
            {rows.map((r, i) => {
              if (i !== ptr) {
                const rowDone = byRow[r].every((s) =>
                  doneSet.has(`${s.row},${s.col}`),
                );
                return (
                  <div
                    key={r}
                    onClick={() =>
                      setRowPtr((prev) => ({ ...prev, [selectedIdx]: i }))
                    }
                    className="rounded-[10px] px-3 py-2 bg-linen-2 border border-linen-3
                               cursor-pointer hover:border-border"
                  >
                    <div
                      className="text-[11px] font-medium text-ink-3 uppercase
                                  tracking-wide mb-1.5"
                    >
                      {i === ptr + 1 ? "Up next · " : ""}row {r + 1}
                      {rowDone ? " ✓" : ""}
                    </div>
                    <RenderCoords
                      stitches={byRow[r]}
                      type="other"
                      doneSet={doneSet}
                      onToggle={onToggle}
                    />
                  </div>
                );
              }

              return (
            <div
              key={r}
              ref={curRowRef}
              className="rounded-[10px] px-3 py-2 bg-parch
                          border border-accent shrink-0"
            >
              <div
                className="text-[11px] font-medium text-ink-3 uppercase
                            tracking-wide mb-1.5 flex items-center gap-2"
              >
                Current · row {curRow + 1}
                {allCurrentDone ? (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full
                                 bg-moss-bg text-moss font-medium"
                  >
                    all done ✓
                  </span>
                ) : (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full
                                 bg-gold-bg text-gold font-medium"
                  >
                    in progress
                  </span>
                )}
                {/* mark all / unmark all */}
                <button
                  className="ml-auto normal-case tracking-normal text-[11px] px-2.5 py-0.5
                           border border-border rounded-lg bg-parch hover:bg-linen-2"
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

              <RenderCoords
                stitches={byRow[curRow]}
                type="current"
                doneSet={doneSet}
                onToggle={onToggle}
              />
            </div>
              );
            })}
          </div>
          <div className="px-3 py-2 border-t border-border shrink-0">
            {/* navigation */}
            <div className="flex gap-2 items-center shrink-0">
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
                row {ptr + 1} of {rows.length} for this color
              </span>
              <button
                onClick={goToNextRowAndMarkDone}
                disabled={isLastRow}
                className="text-[13px] font-medium px-4 py-1.5 rounded-lg
                         bg-accent text-white border border-accent
                         hover:bg-accent-hover disabled:opacity-40
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
