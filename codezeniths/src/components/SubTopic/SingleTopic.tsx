"use client";

import { FC } from "react";
import { useGetSingleTopic } from "@/api/topic.queries";
import SubTopic from "./SubTopic";
import { TopicCard } from "./TopicCard";
import { ProgressCard } from "../shared/progress-card";

interface SingleTopicProps {
  slug: string;
}

// ─────────────────────────────────────────────
// Skeleton — mirrors the two-column layout exactly
// Left col: TopicCard + ProgressCard
// Right col: SubTopic accordions
// ─────────────────────────────────────────────

function SingleTopicSkeleton() {
  return (
    <div className="flex flex-row gap-6 animate-pulse">

      {/* Left column */}
      <div className="flex flex-col gap-6 flex-1">

        {/* TopicCard skeleton */}
        <div className="w-72 rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3 bg-foreground-light dark:bg-foreground-dark px-6 py-6 flex flex-col gap-4">
          {/* Icon + level badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="w-11 h-11 rounded-md bg-foreground-light-shade3 dark:bg-foreground-dark-shade3 shrink-0" />
            <div className="h-6 w-24 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
          </div>
          {/* Title */}
          <div className="h-6 w-3/4 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
          {/* Stats */}
          <div className="flex flex-col gap-2">
            <div className="h-4 w-24 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
            <div className="h-4 w-28 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
            <div className="h-4 w-20 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
          </div>
          {/* Description lines */}
          <div className="flex flex-col gap-1.5">
            <div className="h-3.5 w-full rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
            <div className="h-3.5 w-full rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
            <div className="h-3.5 w-2/3 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
          </div>
          {/* Button */}
          <div className="h-9 w-full rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3 mt-1" />
        </div>

        {/* ProgressCard skeleton */}
        <div className="rounded-2xl border border-foreground-light-shade3 dark:border-foreground-dark-shade3 bg-foreground-light dark:bg-foreground-dark p-6 flex items-center gap-10">
          <div className="w-52 h-52 rounded-full bg-foreground-light-shade3 dark:bg-foreground-dark-shade3 shrink-0" />
          <div className="flex flex-col gap-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-md bg-foreground-light-shade3 dark:bg-foreground-dark-shade3"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right column — subtopic accordions */}
      <div className="flex flex-col gap-3 flex-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3 bg-foreground-light dark:bg-foreground-dark px-6 py-5 flex items-center justify-between"
          >
            {/* Chevron + title */}
            <div className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3 shrink-0" />
              <div
                className="h-4 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3"
                style={{ width: `${120 + (i % 3) * 40}px` }}
              />
            </div>
            {/* Linear progress bar placeholder */}
            <div className="flex items-center gap-3 w-48 shrink-0">
              <div className="h-3 w-10 rounded-sm bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
              <div className="flex-1 h-2.5 rounded-full bg-foreground-light-shade3 dark:bg-foreground-dark-shade3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SingleTopic
// ─────────────────────────────────────────────

const SingleTopic: FC<SingleTopicProps> = ({ slug }) => {
  const { data: topic, isLoading, isError, error } = useGetSingleTopic(slug);

  if (isLoading) return <SingleTopicSkeleton />;

  if (isError) {
    return (
      <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-6 py-5">
        <p className="typography-base font-sans text-destructive">
          {error?.message ?? "Failed to load topic."}
        </p>
      </div>
    );
  }

  if (!topic) {
    return (
      <p className="typography-base font-sans text-muted-dark">Topic not found.</p>
    );
  }

  return (
    <div className="flex flex-row gap-6">

      {/* ── Left column: TopicCard + ProgressCard ──────────────── */}
      <section className="flex flex-col gap-6 flex-1">
        <TopicCard
          title={topic.title}
          description={topic.description}
          level={topic.level}
          iconPath={topic.iconPath}
          subTopicCount={topic.subTopics.length}
          problemCount={topic.problemCount}
          solvedCount={topic.solvedCount}
          onGetStarted={() => {
            document.getElementById("subtopics")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
        <ProgressCard
          easy={topic.byDifficulty.easy}
          medium={topic.byDifficulty.medium}
          hard={topic.byDifficulty.hard}
          revisit={topic.totalRevisits}
        />
      </section>

      {/* ── Right column: Subtopics list ────────────────────────── */}
      {topic.subTopics.length === 0 ? (
        <p className="typography-base font-sans text-muted-light dark:text-muted-dark">
          No subtopics available yet.
        </p>
      ) : (
        <div id="subtopics" className="flex flex-col gap-3 flex-1">
          {topic.subTopics.map((subTopic, i) => (
            <SubTopic
              key={subTopic.id}
              subTopic={subTopic}
              defaultOpen={i === 0}
              topicSlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleTopic;