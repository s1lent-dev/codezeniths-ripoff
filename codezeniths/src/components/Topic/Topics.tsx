"use client";

import { FC } from "react";
import SingleTopicCard from "./SingleTopic";
import { useGetAllTopics } from "@/api/topic.queries";

const TopicsGrid: FC = () => {
  const { data: topics, isLoading, isError, error } = useGetAllTopics();

  if (isLoading) {
    return (
        <main className="w-full flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="
              h-44 w-75 rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3
              bg-foreground-light dark:bg-foreground-dark animate-pulse
            "
          />
        ))}
      </div>
    </main>
      
    );
  }

  if (isError) {
    return (
      <div
        className="
          rounded-sm border border-destructive/40 bg-destructive/10
          px-6 py-4
        "
      >
        <p className="typography-p font-sans text-destructive">
          {error?.message ?? "Failed to load topics."}
        </p>
      </div>
    );
  }

  if (!topics || topics.length === 0) {
    return (
      <p className="typography-p font-sans text-muted-dark">
        No topics found.
      </p>
    );
  }

  return (
    <main className="w-full flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic) => (
                <SingleTopicCard key={topic.id} topic={topic} />
            ))}
        </div>
    </main>
  );
};

export default TopicsGrid;