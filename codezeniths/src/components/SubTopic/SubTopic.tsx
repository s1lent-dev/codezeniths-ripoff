"use client";

import { FC, memo, useState } from "react";
import type { SubTopic as SubTopicType } from "@/db/queries";
import Problem from "./Problem";
import { LinearProgress } from "@/components/shared/linear-progress";

interface SubTopicProps {
  subTopic: SubTopicType;
  defaultOpen?: boolean;
  topicSlug: string;
}

const SubTopic: FC<SubTopicProps> = memo(({ subTopic, topicSlug, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { title, problems, solvedCount, problemCount } = subTopic;

  return (
    <div
      className="
        rounded-sm border border-background-light-shade3 dark:border-background-dark-shade3
        bg-foreground-light dark:bg-foreground-dark
        overflow-hidden
        transition-colors duration-200"
    >
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          w-full flex items-center justify-between
          px-6 py-5
          cursor-pointer
          group/trigger
        "
      >
        {/* Left — chevron + title */}
        <div className="flex items-center gap-4 min-w-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`
              text-muted-light dark:text-muted-dark shrink-0
              transition-transform duration-200
              ${isOpen ? "rotate-180" : "rotate-0"}
            `}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>

          <span
            className="
              typography-h5 font-sans font-medium
              text-foreground-dark-shade3
              dark:text-foreground-light-shade3
              transition-colors duration-150
              text-left truncate
            "
          >
            {title}
          </span>
        </div>

        {/* Right — linear progress bar */}
        <div className="shrink-0 ml-6 w-64" onClick={(e) => e.stopPropagation()}>
          <LinearProgress solved={solvedCount} total={problemCount} />
        </div>
      </button>

      {/* Collapsible problem list */}
      <div
        className={`
          transition-all duration-200 ease-in-out overflow-hidden
          ${isOpen ? "max-h-[9999px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="border-t border-background-light-shade3 dark:border-background-dark-shade3">
          {problems.length === 0 ? (
            <p className="typography-p font-sans text-muted-dark px-6 py-4">
              No problems yet.
            </p>
          ) : (
            problems.map((problem) => (
              <Problem key={problem.id} problem={problem} topicSlug={topicSlug} />
            ))
          )}
        </div>
      </div>
    </div>
  );
});

SubTopic.displayName = "SubTopic";

export default SubTopic;