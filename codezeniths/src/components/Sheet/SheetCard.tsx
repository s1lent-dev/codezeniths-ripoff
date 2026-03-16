'use client'

import { FC, memo } from "react";
import type { SheetCardData } from "./sheetData";

interface Props {
    sheet: SheetCardData;
}

const SheetCard: FC<Props> = memo(({ sheet }) => {
    return (
        <section className="bg-foreground-light dark:bg-foreground-dark w-175 p-10 flex flex-col items-start gap-6 relative overflow-hidden rounded-md">
            <div
                className="
                absolute -right-28 -top-40 w-60 h-60 rounded-full 
                pointer-events-none blur-3xl opacity-40
                bg-linear-to-br from-primary-shade1 via-primary-shade3 to-primary-shade2
                animate-pulse-slow"
            />

            <div
                className="
                absolute -right-32 -bottom-44 w-65 h-65 rounded-full 
                pointer-events-none blur-[90px] opacity-30
                bg-linear-to-tl from-primary-shade3 via-primary-shade1 to-primary-shade2
                animate-pulse-slow delay-700"
            />

            <div
                className="
                absolute -left-28 -top-40 w-60 h-60 rounded-full 
                pointer-events-none blur-3xl opacity-40
                bg-linear-to-br from-primary-shade1 via-primary-shade3 to-primary-shade2
                animate-pulse-slow"
            />

            <div
                className="
                absolute -left-32 -bottom-44 w-65 h-65 rounded-full 
                pointer-events-none blur-[90px] opacity-30
                bg-linear-to-tl from-primary-shade3 via-primary-shade1 to-primary-shade2
                animate-pulse-slow delay-700"
            />

            <div className="flex flex-col gap-2">
                <h2 className="font-sans typography-h4 font-bold text-foreground-dark-shade3 dark:text-foreground-light-shade3">
                    {sheet.title}
                </h2>

                <div className="flex flex-row gap-2 flex-wrap text-sm">
                    <span className="text-muted-light dark:text-muted-dark">
                        {sheet.totalProblems} Problems
                    </span>
                    <span className="text-body-light dark:text-body-dark">|</span>
                    <span className="text-muted-light dark:text-muted-dark">
                        {sheet.easyProblems} Easy
                    </span>
                    <span className="text-body-light dark:text-body-dark">|</span>
                    <span className="text-muted-light dark:text-muted-dark">
                        {sheet.mediumProblems} Medium
                    </span>
                    <span className="text-body-light dark:text-body-dark">|</span>
                    <span className="text-muted-light dark:text-muted-dark">
                        {sheet.hardProblems} Hard
                    </span>
                </div>
            </div>

            <p className="font-sans typography-p text-body-light dark:text-body-dark w-145">
                {sheet.description}
            </p>

            <div>
                <button
                    type="button"
                    className="bg-primary text-foreground-light dark:text-foreground-light px-6 py-2 rounded-full cursor-pointer font-medium hover:bg-primary-dark transition-colors"
                >
                    Get Started
                </button>
            </div>
        </section>
    );
});

SheetCard.displayName = "SheetCard";

export default SheetCard;