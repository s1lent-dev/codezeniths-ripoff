import { Difficulty } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma.client";

// ─────────────────────────────────────────────
// Shared primitive schemas
// ─────────────────────────────────────────────

const DifficultySchema = z.nativeEnum(Difficulty);

const DifficultyDistributionSchema = z.object({
  easy: z.number().int().nonnegative(),
  medium: z.number().int().nonnegative(),
  hard: z.number().int().nonnegative(),
});

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
      // Only pull difficulty — no other problem data needed here
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
      if (problem.difficulty === Difficulty.EASY) distribution.easy++;
      else if (problem.difficulty === Difficulty.MEDIUM) distribution.medium++;
      else if (problem.difficulty === Difficulty.HARD) distribution.hard++;
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

  // Parse & validate the entire array — throws ZodError if shape is wrong
  return z.array(TopicMetaSchema).parse(topics);
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

export type SingleTopic = z.infer<typeof SingleTopicSchema>;
export type SubTopic = z.infer<typeof SubTopicSchema>;
export type TopicProblem = z.infer<typeof ProblemSchema>;

export async function getSingleTopic(slug: string): Promise<SingleTopic | null> {
  const raw = await prisma.topic.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!raw) return null;

  // Flatten join-table wrapper: { order, problem: {...} } → { order, ...problem }
  const shaped = {
    ...raw,
    subTopics: raw.subTopics.map((subTopic) => ({
      ...subTopic,
      problems: subTopic.problems.map(({ order, problem }) => ({
        order,
        ...problem,
      })),
    })),
  };

  // Parse & validate — throws ZodError if shape is wrong
  return SingleTopicSchema.parse(shaped);
}