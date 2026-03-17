"use client";

import { useGetProgress } from "@/api/topic.queries";
import { ProgressCard, ProgressCardSkeleton } from "@/components/shared/progress-card";

export function ProgressSection() {
  const { data, isLoading, isError } = useGetProgress();

  if (isLoading) return (
    <main className="w-full flex items-center justify-center">
      <ProgressCardSkeleton />
    </main>
  )

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center p-6 rounded-2xl bg-foreground-light dark:bg-foreground-dark border border-foreground-light-shade3 dark:border-foreground-dark-shade3">
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Failed to load progress.
        </p>
      </div>
    );
  }

  const { byDifficulty, totalRevisits } = data;

  return (
    <main className="w-full flex items-center justify-center">
      <ProgressCard
      easy={byDifficulty.easy}
      medium={byDifficulty.medium}
      hard={byDifficulty.hard}
      revisit={totalRevisits}
    />
    </main>
  );
}