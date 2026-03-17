import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { type TopicMeta, type SingleTopic } from "@/db/queries";
import { Status } from "@prisma/client";
import { updateProblemRevisitAction, updateProblemStatusAction } from "./problem.actions";

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
  status: z.nativeEnum(Status),
  revisit: z.boolean(),
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

// updatedAt comes back as a Date from Prisma — use z.date() not z.string().datetime()
const UpdateProblemStatusResultSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  status: z.nativeEnum(Status),
  updatedAt: z.date(),
});

const UpdateProblemRevisitResultSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  revisit: z.boolean(),
  updatedAt: z.date(),
});

// ─────────────────────────────────────────────
// useGetAllTopics
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

// ─────────────────────────────────────────────
// useUpdateProblemStatus
// ─────────────────────────────────────────────

export function useUpdateProblemStatus(topicSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, status }: { slug: string; status: Status }) => {
      const res = await updateProblemStatusAction(slug, status);
      return UpdateProblemStatusResultSchema.parse(res);
    },

    // 1. Instantly update the UI before the server responds
    onMutate: async ({ slug, status }) => {
      await queryClient.cancelQueries({ queryKey: topicKeys.single(topicSlug) });
      const previous = queryClient.getQueryData<SingleTopic>(topicKeys.single(topicSlug));

      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return {
          ...old,
          subTopics: old.subTopics.map((sub) => ({
            ...sub,
            problems: sub.problems.map((p) =>
              p.slug === slug ? { ...p, status } : p
            ),
          })),
        };
      });

      return { previous };
    },

    // 2. On success, write the confirmed server value into the cache
    onSuccess: (result) => {
      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return {
          ...old,
          subTopics: old.subTopics.map((sub) => ({
            ...sub,
            problems: sub.problems.map((p) =>
              p.slug === result.slug ? { ...p, status: result.status } : p
            ),
          })),
        };
      });
    },

    // 3. Roll back to snapshot if the server call fails
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(topicKeys.single(topicSlug), context.previous);
      }
    },
  });
}

// ─────────────────────────────────────────────
// useUpdateProblemRevisit
// ─────────────────────────────────────────────

export function useUpdateProblemRevisit(topicSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, revisit }: { slug: string; revisit: boolean }) => {
      const res = await updateProblemRevisitAction(slug, revisit);
      return UpdateProblemRevisitResultSchema.parse(res);
    },

    // 1. Instantly update the UI before the server responds
    onMutate: async ({ slug, revisit }) => {
      await queryClient.cancelQueries({ queryKey: topicKeys.single(topicSlug) });
      const previous = queryClient.getQueryData<SingleTopic>(topicKeys.single(topicSlug));

      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return {
          ...old,
          subTopics: old.subTopics.map((sub) => ({
            ...sub,
            problems: sub.problems.map((p) =>
              p.slug === slug ? { ...p, revisit } : p
            ),
          })),
        };
      });

      return { previous };
    },

    // 2. On success, write the confirmed server value into the cache
    onSuccess: (result) => {
      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return {
          ...old,
          subTopics: old.subTopics.map((sub) => ({
            ...sub,
            problems: sub.problems.map((p) =>
              p.slug === result.slug ? { ...p, revisit: result.revisit } : p
            ),
          })),
        };
      });
    },

    // 3. Roll back to snapshot if the server call fails
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(topicKeys.single(topicSlug), context.previous);
      }
    },
  });
}