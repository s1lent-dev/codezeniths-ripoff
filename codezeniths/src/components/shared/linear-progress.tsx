"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LinearProgressProps {
  solved: number;
  total: number;
  className?: string;
}

export function LinearProgress({ solved, total, className }: LinearProgressProps) {
  const [width, setWidth] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const prevTargetRef = useRef(0);

  const target = total > 0 ? (solved / total) * 100 : 0;

  useEffect(() => {
    const from = prevTargetRef.current;
    const to = target;
    prevTargetRef.current = to;

    startTimeRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const DURATION = 900;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const t = Math.min(elapsed / DURATION, 1);
      // ease out expo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setWidth(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* Label */}
      <span className="font-mono text-sm font-medium text-body-light dark:text-body-dark tabular-nums shrink-0 w-14">
        {solved}/{total}
      </span>

      {/* Track */}
      <div className="relative flex-1 h-2.5 rounded-full overflow-hidden bg-foreground-light-shade3 dark:bg-foreground-dark-shade3">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${width}%`,
            background: "linear-gradient(90deg, #6366f1 0%, #818cf8 100%)",
            boxShadow: "0 0 10px rgba(99,102,241,0.5)",
          }}
        />
      </div>
    </div>
  );
}