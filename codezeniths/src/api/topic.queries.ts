import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { TopicMeta, SingleTopic } from "@/db/queries";

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────

export const topicKeys = {
  all: ["topics"] as const,
  single: (slug: string) => ["topics", slug] as const,
};

// ─────────────────────────────────────────────
// Zod schemas — client-safe, no Prisma imports
// ─────────────────────────────────────────────

const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

const DifficultyDistributionSchema = z.object({
  easy: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  hard: z.number().int().nonnegative(),
});

const TopicMetaSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  order: z.number().int(),
  iconPath: z.string().nullable(),
  subTopicCount: z.number().int().nonnegative(),
  problemCount: z.number().int().nonnegative(),
  difficultyDistribution: DifficultyDistributionSchema,
});

const ProblemSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  difficulty: DifficultySchema,
  leetcodeUrl: z.url().nullable(),
  articleUrl: z.url().nullable(),
  order: z.number().int().nonnegative(),
});

const SubTopicSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  order: z.number().int(),
  problems: z.array(ProblemSchema),
});

const SingleTopicSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  order: z.number().int(),
  iconPath: z.string().nullable(),
  subTopics: z.array(SubTopicSchema),
});

// ─────────────────────────────────────────────
// useGetAllTopics
// Fetches from GET /api/topics
// ─────────────────────────────────────────────

export function useGetAllTopics() {
  return useQuery<TopicMeta[], Error>({
    queryKey: topicKeys.all,
    queryFn: async () => {
      const res = await fetch("/api/topics");

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "Failed to fetch topics.");
      }

      const json = await res.json();
      return z.array(TopicMetaSchema).parse(json);
    },
  });
}

// ─────────────────────────────────────────────
// useGetSingleTopic
// Fetches from GET /api/topics/:slug
// ─────────────────────────────────────────────

export function useGetSingleTopic(slug: string) {
  return useQuery<SingleTopic, Error>({
    queryKey: topicKeys.single(slug),
    queryFn: async () => {
      const res = await fetch(`/api/topics/${slug}`);

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? `Failed to fetch topic "${slug}".`);
      }

      const json = await res.json();
      return SingleTopicSchema.parse(json);
    },
    enabled: !!slug,
  });
}