import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { type TopicMeta, type SingleTopic, type Progress } from "@/db/queries";
import { Status, Level } from "@prisma/client";
import {
  getProgressAction,
  updateProblemRevisitAction,
  updateProblemStatusAction,
} from "./problem.actions";

// ─────────────────────────────────────────────
// Query keys
// ─────────────────────────────────────────────

export const topicKeys = {
  all: ["topics"] as const,
  single: (slug: string) => ["topics", slug] as const,
};

export const progressKeys = {
  all: ["progress"] as const,
};

// ─────────────────────────────────────────────
// Zod schemas — must match getSingleTopic shape
// ─────────────────────────────────────────────

const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

const DifficultyDistributionSchema = z.object({
  easy:   z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  hard:   z.number().int().nonnegative(),
});

const SolvedDistributionSchema = z.object({
  easy:   z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
  medium: z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
  hard:   z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
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
  problemCount: z.number().int().nonnegative(),
  solvedCount:  z.number().int().nonnegative(),
  problems: z.array(ProblemSchema),
});

const SingleTopicSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  order: z.number().int(),
  iconPath: z.string().nullable(),
  description: z.string().nullable(),
  level: z.nativeEnum(Level),
  problemCount:  z.number().int().nonnegative(),
  solvedCount:   z.number().int().nonnegative(),
  byDifficulty:  SolvedDistributionSchema,
  totalRevisits: z.number().int().nonnegative(),
  subTopics: z.array(SubTopicSchema),
});

const ProgressSchema = z.object({
  totalProblems: z.number().int().nonnegative(),
  totalSolved:   z.number().int().nonnegative(),
  byDifficulty:  SolvedDistributionSchema,
  totalRevisits: z.number().int().nonnegative(),
});

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
// patchTopicCache
//
// Applies a patch function to every problem in the
// cache, then recomputes ALL derived fields in one pass:
//   - sub.solvedCount     per subtopic
//   - topic.solvedCount   total
//   - topic.byDifficulty  easy/medium/hard solved+total
//   - topic.totalRevisits
// ─────────────────────────────────────────────

type CachedProblem = SingleTopic["subTopics"][0]["problems"][0];

function patchTopicCache(
  old: SingleTopic,
  patch: (p: CachedProblem) => CachedProblem
): SingleTopic {
  const subTopics = old.subTopics.map((sub) => {
    const problems = sub.problems.map(patch);
    return {
      ...sub,
      problems,
      solvedCount: problems.filter((p) => p.status === Status.SOLVED).length,
    };
  });

  const allProblems = subTopics.flatMap((s) => s.problems);

  // Recompute byDifficulty
  const byDifficulty = {
    easy:   { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard:   { solved: 0, total: 0 },
  };
  for (const p of allProblems) {
    const key =
      p.difficulty === "EASY"   ? "easy"   :
      p.difficulty === "MEDIUM" ? "medium" : "hard";
    byDifficulty[key].total++;
    if (p.status === Status.SOLVED) byDifficulty[key].solved++;
  }

  return {
    ...old,
    subTopics,
    solvedCount:   allProblems.filter((p) => p.status === Status.SOLVED).length,
    totalRevisits: allProblems.filter((p) => p.revisit).length,
    byDifficulty,
  };
}

// ─────────────────────────────────────────────
// useGetProgress
// ─────────────────────────────────────────────

export function useGetProgress() {
  return useQuery<Progress, Error>({
    queryKey: progressKeys.all,
    queryFn: async () => {
      const res = await getProgressAction();
      return ProgressSchema.parse(res);
    },
  });
}

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

    onMutate: async ({ slug, status }) => {
      await queryClient.cancelQueries({ queryKey: topicKeys.single(topicSlug) });
      const previous = queryClient.getQueryData<SingleTopic>(topicKeys.single(topicSlug));

      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return patchTopicCache(old, (p) =>
          p.slug === slug ? { ...p, status } : p
        );
      });

      return { previous };
    },

    onSuccess: (result) => {
      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return patchTopicCache(old, (p) =>
          p.slug === result.slug ? { ...p, status: result.status } : p
        );
      });

      // Keep global progress card in sync
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
    },

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

    onMutate: async ({ slug, revisit }) => {
      await queryClient.cancelQueries({ queryKey: topicKeys.single(topicSlug) });
      const previous = queryClient.getQueryData<SingleTopic>(topicKeys.single(topicSlug));

      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return patchTopicCache(old, (p) =>
          p.slug === slug ? { ...p, revisit } : p
        );
      });

      return { previous };
    },

    onSuccess: (result) => {
      queryClient.setQueryData<SingleTopic>(topicKeys.single(topicSlug), (old) => {
        if (!old) return old;
        return patchTopicCache(old, (p) =>
          p.slug === result.slug ? { ...p, revisit: result.revisit } : p
        );
      });
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(topicKeys.single(topicSlug), context.previous);
      }
    },
  });
}