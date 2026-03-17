"use client";

import Image from "next/image";
import { BookOpen, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type Level = "FUNDAMENTAL" | "INTERMEDIATE" | "ADVANCED";

export interface TopicCardProps {
  title: string;
  description: string | null;
  level: Level;
  iconPath: string | null;
  subTopicCount: number;
  problemCount: number;
  solvedCount: number;
  onGetStarted?: () => void;
  className?: string;
}

// ─────────────────────────────────────────────
// Level badge config
// ─────────────────────────────────────────────

const levelConfig: Record<Level, { label: string; color: string; bg: string; border: string }> = {
  FUNDAMENTAL: {
    label: "Fundamental",
    color: "var(--color-teal)",
    bg: "rgba(115, 218, 202, 0.08)",
    border: "rgba(115, 218, 202, 0.2)",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    color: "var(--color-warning)",
    bg: "rgba(224, 175, 104, 0.08)",
    border: "rgba(224, 175, 104, 0.2)",
  },
  ADVANCED: {
    label: "Advanced",
    color: "var(--color-destructive)",
    bg: "rgba(255, 70, 85, 0.08)",
    border: "rgba(255, 70, 85, 0.2)",
  },
};

// ─────────────────────────────────────────────
// TopicCard
// ─────────────────────────────────────────────

export function TopicCard({
  title,
  description,
  level,
  iconPath,
  subTopicCount,
  problemCount,
  solvedCount,
  onGetStarted,
  className,
}: TopicCardProps) {
  const lvl = levelConfig[level];

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3",
        "bg-foreground-light dark:bg-foreground-dark",
        "px-8 py-7 gap-5",
        className
      )}
    >
      {/* Ambient glow — inherits level accent color */}
      <div
        className="absolute -right-16 -top-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-[0.12]"
        style={{ background: lvl.color }}
      />

      {/* ── Top row: icon + level badge ─────────────────── */}
      <div className="flex items-start justify-between gap-4 z-10">
        {/* Icon */}
        <div className="w-24 h-24 rounded-md flex items-center justify-center bg-foreground-light-shade3 dark:bg-foreground-dark-shade3 shrink-0">
          {iconPath ? (
            <Image
              src={iconPath}
              alt={title}
              width={100}
              height={100}
              className="object-contain"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-sm"
              style={{ background: `${lvl.color}30` }}
            />
          )}
        </div>

        {/* Level badge */}
        <span
          className="text-[11px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-sm border shrink-0"
          style={{ color: lvl.color, background: lvl.bg, borderColor: lvl.border }}
        >
          {lvl.label}
        </span>
      </div>

      {/* ── Title ───────────────────────────────────────── */}
      <h2 className="typography-h3 font-sans font-semibold text-foreground-dark-shade3 dark:text-foreground-light-shade3 z-10 leading-tight">
        {title}
      </h2>

      {/* ── Stats row ───────────────────────────────────── */}
      <div className="flex items-center gap-5 z-10 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Layers size={13} className="text-muted-light dark:text-muted-dark shrink-0" />
          <span className="typography-small font-sans text-muted-light dark:text-muted-dark tabular-nums">
            {subTopicCount}{" "}
            <span className="text-muted-light/70 dark:text-muted-dark/70">
              {subTopicCount === 1 ? "subtopic" : "subtopics"}
            </span>
          </span>
        </div>

        <span className="text-muted-light/40 dark:text-muted-dark/40 text-xs">·</span>

        <div className="flex items-center gap-1.5">
          <BookOpen size={13} className="text-muted-light dark:text-muted-dark shrink-0" />
          <span className="typography-small font-sans text-muted-light dark:text-muted-dark tabular-nums">
            {problemCount}{" "}
            <span className="text-muted-light/70 dark:text-muted-dark/70">problems</span>
          </span>
        </div>

        <span className="text-muted-light/40 dark:text-muted-dark/40 text-xs">·</span>

        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="shrink-0" style={{ color: "var(--color-teal)" }} />
          <span className="typography-small font-sans tabular-nums" style={{ color: "var(--color-teal)" }}>
            {solvedCount}
          </span>
          <span className="typography-small font-sans text-muted-light/70 dark:text-muted-dark/70">
            solved
          </span>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────── */}
      {description && (
        <p className="typography-small font-sans text-muted-light dark:text-muted-dark leading-relaxed z-10 line-clamp-3 w-100">
          {description}
        </p>
      )}

      {/* ── Get Started button ───────────────────────────── */}
      <button
        onClick={onGetStarted}
        className="
          mt-auto z-10 group
          flex items-center justify-center gap-2
          w-full px-4 py-2.5 rounded-sm
          border border-background-light-shade3 dark:border-background-dark-shade3
          bg-foreground-light-shade3 dark:bg-foreground-dark-shade3
          hover:border-opacity-80
          typography-small font-sans font-medium
          text-foreground-dark-shade3 dark:text-foreground-light-shade3
          transition-all duration-200
          hover:bg-foreground-light-shade3/80 dark:hover:bg-foreground-dark-shade3/80
        "
        style={{
          ["--hover-border" as string]: lvl.color,
        }}
      >
        Get Started
        <ArrowRight
          size={14}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}