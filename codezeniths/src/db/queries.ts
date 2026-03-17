import { Difficulty, Level, Status } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma.client";

// ─────────────────────────────────────────────
// Shared primitive schemas
// ─────────────────────────────────────────────

const DifficultySchema = z.enum(Difficulty);
const LevelSchema      = z.enum(Level);

const DifficultyDistributionSchema = z.object({
  easy:   z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  hard:   z.number().int().nonnegative(),
});

// Reusable schema for solved + total counts per difficulty
const SolvedDistributionSchema = z.object({
  easy:   z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
  medium: z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
  hard:   z.object({ solved: z.number().int().nonnegative(), total: z.number().int().nonnegative() }),
});

export type SolvedDistribution = z.infer<typeof SolvedDistributionSchema>;

// ─────────────────────────────────────────────
// Shared helper — compute SolvedDistribution
// from a flat array of { difficulty, status }
// ─────────────────────────────────────────────

function computeSolvedDistribution(
  problems: { difficulty: Difficulty; status: Status }[]
): SolvedDistribution {
  const dist = {
    easy:   { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard:   { solved: 0, total: 0 },
  };

  for (const { difficulty, status } of problems) {
    const key =
      difficulty === Difficulty.EASY   ? "easy"   :
      difficulty === Difficulty.MEDIUM ? "medium" : "hard";

    dist[key].total++;
    if (status === Status.SOLVED) dist[key].solved++;
  }

  return dist;
}

// ─────────────────────────────────────────────
// getAllTopics — schema & return type
// ─────────────────────────────────────────────

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

export type TopicMeta = z.infer<typeof TopicMetaSchema>;

export async function getAllTopics(): Promise<TopicMeta[]> {
  const raw = await prisma.topic.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      order: true,
      iconPath: true,
      _count: {
        select: { subTopics: true },
      },
      problems: {
        select: {
          problem: {
            select: { difficulty: true },
          },
        },
      },
    },
  });

  const topics = raw.map((topic) => {
    const distribution = { easy: 0, medium: 0, hard: 0 };

    for (const { problem } of topic.problems) {
      if (problem.difficulty === Difficulty.EASY)        distribution.easy++;
      else if (problem.difficulty === Difficulty.MEDIUM) distribution.medium++;
      else if (problem.difficulty === Difficulty.HARD)   distribution.hard++;
    }

    return {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      order: topic.order,
      iconPath: topic.iconPath,
      subTopicCount: topic._count.subTopics,
      problemCount: topic.problems.length,
      difficultyDistribution: distribution,
    };
  });

  return z.array(TopicMetaSchema).parse(topics);
}

// ─────────────────────────────────────────────
// getProgress — schema & return type
// ─────────────────────────────────────────────

const ProgressSchema = z.object({
  totalProblems: z.number().int().nonnegative(),
  totalSolved:   z.number().int().nonnegative(),
  byDifficulty:  SolvedDistributionSchema,
  totalRevisits: z.number().int().nonnegative(),
});

export type Progress = z.infer<typeof ProgressSchema>;

export async function getProgress(): Promise<Progress> {
  const problems = await prisma.problem.findMany({
    select: {
      difficulty: true,
      status: true,
      revisit: true,
    },
  });

  const byDifficulty  = computeSolvedDistribution(problems);
  const totalProblems = problems.length;
  const totalSolved   = problems.filter((p) => p.status === Status.SOLVED).length;
  const totalRevisits = problems.filter((p) => p.revisit === true).length;

  return ProgressSchema.parse({ totalProblems, totalSolved, byDifficulty, totalRevisits });
}

// ─────────────────────────────────────────────
// getSingleTopic — schema & return type
// ─────────────────────────────────────────────

const ProblemSchema = z.object({
  id: z.uuidv7(),
  title: z.string(),
  slug: z.string(),
  difficulty: DifficultySchema,
  leetcodeUrl: z.url().nullable(),
  articleUrl: z.url().nullable(),
  status: z.enum(Status),
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
  description: z.string().nullable(),
  level: LevelSchema,
  order: z.number().int(),
  iconPath: z.string().nullable(),
  problemCount: z.number().int().nonnegative(),
  solvedCount:  z.number().int().nonnegative(),
  byDifficulty: SolvedDistributionSchema,
  totalRevisits: z.number().int().nonnegative(),
  subTopics: z.array(SubTopicSchema),
});

export type SingleTopic  = z.infer<typeof SingleTopicSchema>;
export type SubTopic     = z.infer<typeof SubTopicSchema>;
export type TopicProblem = z.infer<typeof ProblemSchema>;

export async function getSingleTopic(slug: string): Promise<SingleTopic | null> {
  const raw = await prisma.topic.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,   // ← new
      level: true,         // ← new
      order: true,
      iconPath: true,
      subTopics: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
          problems: {
            orderBy: { order: "asc" },
            select: {
              order: true,
              problem: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  difficulty: true,
                  leetcodeUrl: true,
                  articleUrl: true,
                  status: true,
                  revisit: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!raw) return null;

  const subTopics = raw.subTopics.map((subTopic) => {
    const problems = subTopic.problems.map(({ order, problem }) => ({
      order,
      ...problem,
    }));

    return {
      id: subTopic.id,
      title: subTopic.title,
      slug: subTopic.slug,
      order: subTopic.order,
      problemCount: problems.length,
      solvedCount:  problems.filter((p) => p.status === Status.SOLVED).length,
      problems,
    };
  });

  const allProblems  = subTopics.flatMap((s) => s.problems);
  const byDifficulty = computeSolvedDistribution(allProblems);
  const totalRevisits = allProblems.filter((p) => p.revisit === true).length;

  const shaped = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description,   // ← new
    level: raw.level,               // ← new
    order: raw.order,
    iconPath: raw.iconPath,
    problemCount: allProblems.length,
    solvedCount:  allProblems.filter((p) => p.status === Status.SOLVED).length,
    byDifficulty,
    totalRevisits,
    subTopics,
  };

  return SingleTopicSchema.parse(shaped);
}

// ─────────────────────────────────────────────
// updateProblemStatus — schema & return type
// ─────────────────────────────────────────────

const UpdateProblemStatusInputSchema = z.object({
  slug: z.string(),
  status: z.enum(Status),
});

const UpdateProblemStatusResultSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  status: z.enum(Status),
  updatedAt: z.date(),
});

export type UpdateProblemStatusInput  = z.infer<typeof UpdateProblemStatusInputSchema>;
export type UpdateProblemStatusResult = z.infer<typeof UpdateProblemStatusResultSchema>;

export async function updateProblemStatus(
  input: UpdateProblemStatusInput
): Promise<UpdateProblemStatusResult> {
  const { slug, status } = UpdateProblemStatusInputSchema.parse(input);

  const updated = await prisma.problem.update({
    where: { slug },
    data: { status },
    select: {
      id: true,
      slug: true,
      status: true,
      updatedAt: true,
    },
  });

  return UpdateProblemStatusResultSchema.parse(updated);
}

// ─────────────────────────────────────────────
// updateProblemRevisit — schema & return type
// ─────────────────────────────────────────────

const UpdateProblemRevisitInputSchema = z.object({
  slug: z.string(),
  revisit: z.boolean(),
});

const UpdateProblemRevisitResultSchema = z.object({
  id: z.uuidv7(),
  slug: z.string(),
  revisit: z.boolean(),
  updatedAt: z.date(),
});

export type UpdateProblemRevisitInput  = z.infer<typeof UpdateProblemRevisitInputSchema>;
export type UpdateProblemRevisitResult = z.infer<typeof UpdateProblemRevisitResultSchema>;

export async function updateProblemRevisit(
  input: UpdateProblemRevisitInput
): Promise<UpdateProblemRevisitResult> {
  const { slug, revisit } = UpdateProblemRevisitInputSchema.parse(input);

  const updated = await prisma.problem.update({
    where: { slug },
    data: { revisit },
    select: {
      id: true,
      slug: true,
      revisit: true,
      updatedAt: true,
    },
  });

  return UpdateProblemRevisitResultSchema.parse(updated);
}