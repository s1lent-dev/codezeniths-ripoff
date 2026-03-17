"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DifficultyCount {
  solved: number;
  total: number;
}

interface CircularProgressProps {
  easy: DifficultyCount;
  medium: DifficultyCount;
  hard: DifficultyCount;
  revisit?: number;
  className?: string;
}

// ─────────────────────────────────────────────
// Geometry
//
// SVG: 0° = 3 o'clock, clockwise positive.
//
// 80% of 360° = 288°. Gap at bottom = 72°, so 36° each side.
//
// For symmetric endpoints (same Y):
//   Left end  = 90° + 36° = 126°  → Y = CY + R * sin(126°) = CY + R * 0.809
//   Right end = 90° - 36° = 54°   → Y = CY + R * sin(54°)  = CY + R * 0.809  ✓
//   Arc runs clockwise from 126° → 126° + 288° = 414° (= 54°)
// ─────────────────────────────────────────────

const VIEWBOX   = 240;
const CX        = 120;
const CY        = 108;   // slightly above centre so bottom gap has room for text
const R         = 92;
const STROKE_W  = 7;

const ARC_SPAN  = 288;          // 80% of 360
const ARC_START = 126;          // left endpoint
const GAP_DEG   = 10;           // gap between the 3 segments

function toXY(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function buildArc(startDeg: number, endDeg: number): string {
  const s     = toXY(startDeg);
  const e     = toXY(endDeg);
  const span  = endDeg - startDeg;
  const large = span > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${R} ${R} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function CircularProgress({
  easy,
  medium,
  hard,
  revisit,
  className,
}: CircularProgressProps) {
  const [hovered, setHovered] = useState(false);

  const totalProblems = easy.total + medium.total + hard.total;
  const totalSolved   = easy.solved + medium.solved + hard.solved;
  const overallPct    = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

  if (totalProblems === 0) return null;

  // 3 segments + 2 inter-gaps + 2 half-gaps at outer edges = GAP_DEG * 3 total
  const availableDeg = ARC_SPAN - GAP_DEG * 3;
  const easyDeg      = availableDeg * (easy.total   / totalProblems);
  const mediumDeg    = availableDeg * (medium.total / totalProblems);
  const hardDeg      = availableDeg * (hard.total   / totalProblems);

  const halfGap = GAP_DEG / 2;

  const s0 = ARC_START + halfGap;
  const e0 = s0 + easyDeg;

  const s1 = e0 + GAP_DEG;
  const e1 = s1 + mediumDeg;

  const s2 = e1 + GAP_DEG;
  const e2 = s2 + hardDeg;

  const segments = [
    {
      key:      "easy",
      start:    s0, end: e0,
      fraction: easy.total   > 0 ? easy.solved   / easy.total   : 0,
      color:    "var(--color-teal)",
      delay:    "0s",
    },
    {
      key:      "medium",
      start:    s1, end: e1,
      fraction: medium.total > 0 ? medium.solved / medium.total : 0,
      color:    "var(--color-warning)",
      delay:    "0.15s",
    },
    {
      key:      "hard",
      start:    s2, end: e2,
      fraction: hard.total   > 0 ? hard.solved   / hard.total   : 0,
      color:    "var(--color-destructive)",
      delay:    "0.3s",
    },
  ] as const;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none cursor-pointer", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <svg
        width={VIEWBOX}
        height={VIEWBOX}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        fill="none"
      >
        <defs>
          {segments.map(({ key, color }) => (
            <filter key={key} id={`glow-cp-${key}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feFlood floodColor={color} floodOpacity="0.6" result="c" />
              <feComposite in="c" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {segments.map(({ key, start, end, fraction, color, delay }) => {
          const trackPath = buildArc(start, end);
          const fillEnd   = start + (end - start) * Math.min(fraction, 1);
          const showFill  = fraction > 0.005;

          return (
            <g key={key}>
              {/* Track */}
              <path
                d={trackPath}
                stroke={color}
                strokeWidth={STROKE_W}
                strokeLinecap="round"
                fill="none"
                opacity={0.18}
              />

              {/* Fill — drawn on top of track */}
              {showFill && (
                <path
                  d={buildArc(start, fillEnd)}
                  stroke={color}
                  strokeWidth={STROKE_W}
                  strokeLinecap="round"
                  fill="none"
                  filter={`url(#glow-cp-${key})`}
                  pathLength="1"
                  strokeDasharray={`${fraction} 2`}
                  style={{
                    transition: `stroke-dasharray 1.4s cubic-bezier(0.25, 1, 0.5, 1) ${delay}`,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center -translate-y-4">

          {/* Default: solved / total */}
          <div
            className="absolute -bottom-7 flex flex-col items-center transition-all duration-300 ease-in-out"
            style={{ opacity: hovered ? 0 : 1, transform: hovered ? "scale(0.85)" : "scale(1)" }}
          >
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className="font-mono text-3xl font-bold tabular-nums text-foreground-dark-shade3 dark:text-foreground-light-shade3">
                {totalSolved}
              </span>
              <span className="font-mono text-sm text-foreground-dark-shade3 dark:text-foreground-light-shade3">
                /{totalProblems}
              </span>
            </div>
            <p className="text-[10px] font-sans text-foreground-dark-shade3 dark:text-foreground-light-shade3 tracking-widest uppercase mt-1">
              Solved
            </p>
          </div>

          {/* Hover: percentage */}
          <div
            className="absolute -bottom-7 flex flex-col items-center transition-all duration-300 ease-in-out"
            style={{ opacity: hovered ? 1 : 0, transform: hovered ? "scale(1)" : "scale(0.85)" }}
          >
            <span
              className="font-mono text-3xl font-bold tabular-nums"
              style={{ color: "var(--color-heading-dark-shade1)", opacity: 1 }}
            >
              {overallPct}%
            </span>
            <p className="text-[10px] font-sans text-foreground-dark-shade3 dark:text-foreground-light-shade3 tracking-widest uppercase mt-1">
              Complete
            </p>
          </div>
        </div>

        {/* Revisit — in the bottom gap */}
        {revisit !== undefined && (
          <div className="absolute bottom-10 flex items-baseline gap-2">
            <span
              className="font-mono text-sm font-semibold tabular-nums text-body-light dark:text-body-dark"
            >
              {revisit}
            </span>
            <span className="text-[11px] font-sans text-body-light dark:text-body-dark tracking-wide">
              revisits
            </span>
          </div>
        )}
      </div>
    </div>
  );
}