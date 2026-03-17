"use client";

import { ArrowRight, BookOpen, Layers } from "lucide-react";
import { useGetProgress } from "@/api/topic.queries";
import { ProgressCard, ProgressCardSkeleton } from "@/components/shared/progress-card";

// ─────────────────────────────────────────────
// SheetCard — static, hardcoded content
// ─────────────────────────────────────────────

function SheetCard({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div className="
      relative flex flex-col justify-between overflow-hidden flex-1
      rounded-2xl border border-foreground-light-shade3 dark:border-foreground-dark-shade3
      bg-foreground-light dark:bg-foreground-dark
      px-8 py-8 gap-6
    ">
      {/* Ambient glow */}
      <div
        className="absolute -left-16 -top-16 w-56 h-56 rounded-full pointer-events-none blur-3xl opacity-[0.08]"
        style={{ background: "var(--color-primary)" }}
      />
      <div
        className="absolute -right-16 -bottom-16 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-[0.05]"
        style={{ background: "var(--color-teal)" }}
      />

      {/* Top section */}
      <div className="relative flex flex-col gap-5 z-10">

        {/* Title */}
        <h1 className="typography-h2 font-sans font-semibold text-foreground-dark-shade3 dark:text-foreground-light-shade3 leading-tight">
          Codezeniths Core
        </h1>

        {/* Stats */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ background: "var(--color-primary)" + "18" }}
            >
              <Layers size={13} style={{ color: "var(--color-primary)" }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-mono text-base font-bold text-foreground-dark-shade3 dark:text-foreground-light-shade3 tabular-nums">
                15
              </span>
              <span className="text-[10px] font-sans text-muted-light dark:text-muted-dark tracking-wide uppercase mt-0.5">
                Topics
              </span>
            </div>
          </div>

          <div className="w-px h-8 bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />

          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center"
              style={{ background: "var(--color-teal)" + "18" }}
            >
              <BookOpen size={13} style={{ color: "var(--color-teal)" }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-mono text-base font-bold text-foreground-dark-shade3 dark:text-foreground-light-shade3 tabular-nums">
                600
              </span>
              <span className="text-[10px] font-sans text-muted-light dark:text-muted-dark tracking-wide uppercase mt-0.5">
                Problems
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="typography-base font-sans text-muted-light dark:text-muted-dark leading-relaxed max-w-lg line-clamp-2">
          600 handpicked problems structured as a complete beginner-to-advanced DSA roadmap.
          Covers every essential topic — from arrays and binary search to graphs, dynamic
          programming, and beyond.
        </p>
      </div>

      {/* Get Started button */}
      <button
        onClick={onGetStarted}
        className="
          relative z-10 group self-start
          flex items-center gap-2
          px-5 py-2.5 rounded-sm
          typography-base font-sans font-medium
          text-foreground-dark-shade3 dark:text-foreground-light-shade3
          border border-foreground-light-shade3 dark:border-foreground-dark-shade3
          bg-foreground-light-shade3 dark:bg-foreground-dark-shade3
          hover:bg-foreground-light-shade3/70 dark:hover:bg-foreground-dark-shade3/70
          transition-colors duration-200
        "
      >
        Get Started
        <ArrowRight
          size={15}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// HeroSection
// ─────────────────────────────────────────────

export function HeroSection() {
  const { data, isLoading, isError } = useGetProgress();

  return (
    <section className="w-full flex items-center justify-center">
        <div className="flex items-stretch justify-center gap-6 w-[1100px]">

      {/* Left — SheetCard */}
      <SheetCard
        onGetStarted={() => {
          document.getElementById("topics")?.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Right — ProgressCard */}
      <div className="flex">
        {isLoading ? (
          <ProgressCardSkeleton />
        ) : isError || !data ? (
          <div className="flex-1 flex items-center justify-center rounded-2xl border border-foreground-light-shade3 dark:border-foreground-dark-shade3 bg-foreground-light dark:bg-foreground-dark">
            <p className="text-sm text-muted-light dark:text-muted-dark">
              Failed to load progress.
            </p>
          </div>
        ) : (
          <ProgressCard
            easy={data.byDifficulty.easy}
            medium={data.byDifficulty.medium}
            hard={data.byDifficulty.hard}
            revisit={data.totalRevisits}
          />
        )}
      </div>

    </div>
    </section>
  );
}