"use client";

import { FC, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TopicMeta } from "@/db/queries";

interface SingleTopicCardProps {
    topic: TopicMeta;
}

const SingleTopicCard: FC<SingleTopicCardProps> = memo(({ topic }) => {
    const { title, slug, iconPath, problemCount, difficultyDistribution } = topic;

    return (
        <Link href={`/${slug}`} className="group block h-full">
            <article
                className="
                relative flex h-full flex-col justify-between overflow-hidden
                rounded-sm
                bg-foreground-light dark:bg-foreground-dark
                px-8 py-5 gap-4
                transition-colors duration-200
                cursor-pointer"
            >
                {/* Top row — title + icon */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h3
                            className="
                            typography-h5 font-sans font-medium
                            text-foreground-dark-shade3
                            dark:text-foreground-light-shade3
                            transition-colors duration-200
                            flex-1"
                        >
                            {title}
                        </h3>
                        <p className="typography-p font-sans text-muted-dark">
                            {problemCount} Problems
                        </p>
                    </div>

                    {iconPath && (
                        <div className="shrink-0 w-10 h-10 relative">
                            <Image
                                src={iconPath}
                                alt={`${title} icon`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                </div>

                {/* Problem count */}


                {/* Separator */}
                <div className="h-px w-full bg-background-light-shade3 dark:bg-background-dark-shade3 mt-2" />

                {/* Difficulty tags */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className="
                        typography-span font-sans font-medium
                        text-body-dark-shade3 dark:text-foreground-light-shade3 bg-foreground-light-shade3 dark:bg-foreground-dark-shade3
                        px-3 py-1 rounded-full
                        "
                    >
                        {difficultyDistribution.easy} Easy
                    </span>

                    <span
                        className="
                        typography-span font-sans font-medium
                        text-body-dark-shade3 dark:text-foreground-light-shade3 bg-foreground-light-shade3 dark:bg-foreground-dark-shade3
                        px-3 py-1 rounded-full
                        "
                    >
                        {difficultyDistribution.medium} Medium
                    </span>

                    <span
                        className="
                        typography-span font-sans font-medium
                        text-body-dark-shade3 dark:text-foreground-light-shade3 bg-foreground-light-shade3 dark:bg-foreground-dark-shade3
                        px-3 py-1 rounded-full
                        "
                    >
                        {difficultyDistribution.hard} Hard
                    </span>
                </div>
            </article>
        </Link>
    );
});

SingleTopicCard.displayName = "SingleTopicCard";

export default SingleTopicCard;