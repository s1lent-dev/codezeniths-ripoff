"use client";

import { FC } from "react";
import { useGetSingleTopic } from "@/api/topic.queries";
import SubTopic from "./SubTopic";

interface SingleTopicProps {
  slug: string;
}

const SingleTopic: FC<SingleTopicProps> = ({ slug }) => {
  const { data: topic, isLoading, isError, error } = useGetSingleTopic(slug);

  // ── Loading state ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div
          className="
            h-48 w-200 rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3
            bg-foreground-light dark:bg-foreground-dark animate-pulse
          "
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="
              h-16 w-200 rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3
              bg-foreground-light dark:bg-foreground-dark animate-pulse
            "
          />
        ))}
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-6 py-5">
        <p className="typography-base font-sans text-destructive">
          {error?.message ?? "Failed to load topic."}
        </p>
      </div>
    );
  }

  // ── Not found ──────────────────────────────────────────────────
  if (!topic) {
    return (
      <p className="typography-base font-sans text-muted-dark">Topic not found.</p>
    );
  }

  const totalProblems = topic.subTopics.reduce(
    (acc, st) => acc + st.problems.length,
    0
  );

  console.log(topic);

  return (
    <div className="flex flex-col gap-6 w-200">

      {/* ── Intro card ─────────────────────────────────────────── */}
      <div
        className="
          relative overflow-hidden
          rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3
          bg-foreground-light dark:bg-foreground-dark
          px-10 py-8
          flex items-start justify-between gap-6
        "
      >
        {/* Ambient glow */}
        <div
          className="
            absolute -right-20 -top-20 w-52 h-52 rounded-full
            pointer-events-none blur-3xl opacity-20
            bg-primary
          "
        />
        <div
          className="
            absolute -left-20 -bottom-20 w-52 h-52 rounded-full
            pointer-events-none blur-3xl opacity-10
            bg-primary-shade3
          "
        />

        {/* Text block */}
        <div className="flex flex-col gap-4 z-10">
          <h1
            className="
              typography-h2 font-sans font-medium
              text-foreground-dark-shade3 dark:text-foreground-light-shade3
            "
          >
            {topic.title}
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="typography-base font-sans text-muted-light dark:text-muted-dark">
              {topic.subTopics.length}{" "}
              {topic.subTopics.length === 1 ? "subtopic" : "subtopics"}
            </span>
            <span className="text-secondary-shade1 typography-base">·</span>
            <span className="typography-base font-sans text-muted-light dark:text-muted-dark">
              {totalProblems} problems
            </span>
          </div>
        </div>
      </div>

      {/* ── Subtopics list ─────────────────────────────────────── */}
      {topic.subTopics.length === 0 ? (
        <p className="typography-base font-sans text-muted-light dark:text-muted-dark">
          No subtopics available yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {topic.subTopics.map((subTopic, i) => (
            <SubTopic
              key={subTopic.id}
              subTopic={subTopic}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleTopic;