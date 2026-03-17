"use client";

import { CircularProgress } from "@/components/shared/circular-progress-bar";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface DifficultyCount {
  solved: number;
  total: number;
}

export interface ProgressCardProps {
  easy: DifficultyCount;
  medium: DifficultyCount;
  hard: DifficultyCount;
  revisit?: number;
}

// ─────────────────────────────────────────────
// Difficulty pill config
// ─────────────────────────────────────────────

const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "#73DACA",
    bg: "rgba(115, 218, 202, 0.08)",
    border: "rgba(115, 218, 202, 0.15)",
  },
  medium: {
    label: "Medium",
    color: "#E0AF68",
    bg: "rgba(224, 175, 104, 0.08)",
    border: "rgba(224, 175, 104, 0.15)",
  },
  hard: {
    label: "Hard",
    color: "#FF4655",
    bg: "rgba(255, 70, 85, 0.08)",
    border: "rgba(255, 70, 85, 0.15)",
  },
} as const;

// ─────────────────────────────────────────────
// Difficulty pill
// ─────────────────────────────────────────────

interface DifficultyPillProps {
  difficulty: keyof typeof difficultyConfig;
  solved: number;
  total: number;
}

function DifficultyPill({ difficulty, solved, total }: DifficultyPillProps) {
  const config = difficultyConfig[difficulty];

  return (
    <div
      className="flex items-center justify-center px-7.5 py-2 rounded-md"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <div className="flex flex-col items-center justify-center gap-0.5">
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="font-mono typography-span font-medium text-body-light dark:text-body-dark tabular-nums">
          {solved}
          <span className="text-muted-light dark:text-muted-dark font-normal">
            /{total}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ProgressCard — pure presentational, no fetching
// ─────────────────────────────────────────────

export function ProgressCard({ easy, medium, hard, revisit }: ProgressCardProps) {
  return (
    <div className="flex items-center gap-10 p-6 rounded-2xl bg-foreground-light dark:bg-foreground-dark border border-foreground-light-shade3 dark:border-foreground-dark-shade3">
      <CircularProgress
        easy={easy}
        medium={medium}
        hard={hard}
        revisit={revisit}
        className="w-52 h-52 shrink-0"
      />

      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <DifficultyPill difficulty="easy"   solved={easy.solved}   total={easy.total}   />
        <DifficultyPill difficulty="medium" solved={medium.solved} total={medium.total} />
        <DifficultyPill difficulty="hard"   solved={hard.solved}   total={hard.total}   />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton — exported so ProgressSection can use it
// ─────────────────────────────────────────────

export function ProgressCardSkeleton() {
  return (
    <div className="flex items-center gap-10 p-6 rounded-2xl bg-foreground-light dark:bg-foreground-dark border border-foreground-light-shade3 dark:border-foreground-dark-shade3 animate-pulse">
      <div className="w-52 h-52 rounded-full bg-foreground/[0.06] shrink-0" />
      <div className="flex flex-col gap-3 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md bg-foreground/[0.06]" />
        ))}
      </div>
    </div>
  );
}