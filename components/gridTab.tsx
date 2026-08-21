"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { Pattern, Stitch } from "@/lib/types";

const CELL = 6;
const GRID_INTERVAL = 10;

interface GridProps {
  pattern: Pattern;
  doneSet: Set<string>;
  onToggle: (key: string) => void;
}

//helpers
function drawStitches(
  ctx: CanvasRenderingContext2D,
  pattern: Pattern,
  doneSet: Set<string>,
) {
  for (const { row, col, colorIdx } of pattern.stitches) {
    const color = pattern.colors[colorIdx];
    if (!color) continue;

    ctx.globalAlpha = doneSet.has(`${row},${col}`) ? 0.28 : 1;
    ctx.fillStyle = color.hex;
    ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
  }

  ctx.globalAlpha = 1;
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
  ctx.lineWidth = 0.5;

  for (let col = 0; col <= width; col += GRID_INTERVAL) {
    ctx.beginPath();
    ctx.moveTo(col * CELL, 0);
    ctx.lineTo(col * CELL, height * CELL);
    ctx.stroke();
  }

  for (let row = 0; row <= height; row += GRID_INTERVAL) {
    ctx.beginPath();
    ctx.moveTo(0, row * CELL);
    ctx.lineTo(width * CELL, row * CELL);
    ctx.stroke();
  }
}

function stitchKey(row: number, col: number) {
  return `${row},${col}`;
}

function canvasToGrid(
  e: React.MouseEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    row: Math.floor(((e.clientY - rect.top) * scaleY) / CELL),
    col: Math.floor(((e.clientX - rect.left) * scaleX) / CELL),
  };
}

export function GridTab({ pattern, doneSet, onToggle }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stitchLookup = useRef<Set<string>>(new Set());

  useEffect(() => {
    const keys = new Set<string>();
    for (const s of pattern.stitches) {
      keys.add(stitchKey(s.row, s.col));
    }
    stitchLookup.current = keys;
  }, [pattern]);

  // Redraw on stitches / done state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStitches(ctx, pattern, doneSet);
    drawGridLines(ctx, pattern.width, pattern.height);
  }, [pattern, doneSet]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { row, col } = canvasToGrid(e, canvas);
      const key = stitchKey(row, col);

      if (stitchLookup.current.has(key)) {
        onToggle(key);
      }
    },
    [onToggle],
  );

  return (
    <div>
      <div className="overflow-auto border border-border rounded-xl bg-parch max-h-[calc(100vh-280px)] w-fit">
        <canvas
          ref={canvasRef}
          width={pattern.width * CELL}
          height={pattern.height * CELL}
          onClick={handleClick}
          title="Click to toggle stitch"
          className="block cursor-crosshair max-w-full"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </div>
  );
}
