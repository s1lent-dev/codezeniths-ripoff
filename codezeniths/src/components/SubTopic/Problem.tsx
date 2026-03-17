"use client";

import { FC, memo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { Status } from "@prisma/client";
import type { TopicProblem } from "@/db/queries";
import {
  useUpdateProblemStatus,
  useUpdateProblemRevisit,
} from "@/api/topic.queries";

interface ProblemProps {
  problem: TopicProblem;
  topicSlug: string;
}

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
  EASY: { label: "Easy", className: "text-olive bg-olive/10" },
  MEDIUM: { label: "Medium", className: "text-warning bg-warning/10" },
  HARD: { label: "Hard", className: "text-destructive bg-destructive/10" },
};

const Problem: FC<ProblemProps> = memo(({ problem, topicSlug }) => {
  const { title, slug, difficulty, leetcodeUrl, articleUrl } = problem;
  const diff = difficultyConfig[difficulty as Difficulty];

  // Local state initialized from props — updates instantly on mutation success
  const [status, setStatus] = useState<Status>(problem.status);
  const [revisit, setRevisit] = useState<boolean>(problem.revisit);

  const isSolved = status === Status.SOLVED;

  const { mutate: updateStatus, isPending: isStatusPending } =
    useUpdateProblemStatus(topicSlug);
  const { mutate: updateRevisit, isPending: isRevisitPending } =
    useUpdateProblemRevisit(topicSlug);

  const handleStatusToggle = () => {
    const newStatus = isSolved ? Status.NOT_SOLVED : Status.SOLVED;
    updateStatus(
      { slug, status: newStatus },
      {
        onSuccess: (res) => setStatus(res.status),
      }
    );
  };

  const handleRevisitToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRevisit = !revisit;
    updateRevisit(
      { slug, revisit: newRevisit },
      {
        onSuccess: (res) => setRevisit(res.revisit),
      }
    );
  };

  return (
    <div
      className="
        flex items-center justify-between
        px-6 py-4
        hover:bg-foreground-light-shade3 dark:hover:bg-foreground-dark-shade3
        transition-colors duration-150
        group/problem cursor-pointer
      "
    >
      {/* Left — checkbox + title */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Status checkbox */}
        <button
          type="button"
          onClick={handleStatusToggle}
          disabled={isStatusPending}
          aria-label={isSolved ? "Mark as not solved" : "Mark as solved"}
          className="shrink-0 w-5 h-5 rounded-sm border-2 flex items-center justify-center transition-colors duration-150
            border-muted-light dark:border-muted-dark
            disabled:opacity-50 disabled:cursor-not-allowed
            hover:border-primary
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer
          "
          style={{
            backgroundColor: isSolved ? "var(--color-primary)" : "transparent",
            borderColor: isSolved ? "var(--color-primary)" : undefined,
          }}
        >
          {isSolved && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </button>

        {/* Title */}
        <span
          className={`
            typography-base font-sans
            transition-colors duration-150
            truncate
            ${isSolved
              ? "text-muted-light dark:text-muted-dark"
              : "text-body-light dark:text-body-dark"
            }
          `}
        >
          {title}
        </span>
      </div>

      {/* Right — difficulty + links + revisit star */}
      <div className="flex items-center gap-6 shrink-0 ml-6">
        {/* Difficulty badge */}
        <span
          className={`typography-p font-sans font-medium px-3 py-1 rounded-xs ${diff.className}`}
        >
          {diff.label}
        </span>

        {/* LeetCode link */}
        {leetcodeUrl ? (
          <Link
            href={leetcodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              text-muted-dark hover:text-warning
              transition-colors duration-150
              shrink-0
            "
            title="Open on LeetCode"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
            </svg>
          </Link>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Article link */}
        {articleUrl ? (
          <Link
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              text-muted-dark hover:text-info
              transition-colors duration-150
              shrink-0
            "
            title="Read article"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </Link>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        {/* Revisit star */}
        <button
          onClick={handleRevisitToggle}
          disabled={isRevisitPending}
          aria-label={revisit ? "Remove revisit" : "Mark for revisit"}
          title={revisit ? "Remove revisit" : "Mark for revisit"}
          className="
            shrink-0 transition-colors duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning cursor-pointer
          "
        >
          <Star
            width={20}
            height={20}
            className={
              revisit
                ? "fill-warning stroke-warning"
                : "fill-none stroke-muted-dark hover:stroke-warning"
            }
          />
        </button>
      </div>
    </div>
  );
});

Problem.displayName = "Problem";

export default Problem;