import { Difficulty, Status } from "@prisma/client";
import { z } from "zod";
import { prisma } from "./prisma.client";

// ─────────────────────────────────────────────
// Shared primitive schemas
// ─────────────────────────────────────────────

const DifficultySchema = z.enum(Difficulty);

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
  status: z.enum(Status),
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



// ─────────────────────────────────────────────
// Schema
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
 
export type UpdateProblemStatusInput = z.infer<typeof UpdateProblemStatusInputSchema>;
export type UpdateProblemStatusResult = z.infer<typeof UpdateProblemStatusResultSchema>;
 
// ─────────────────────────────────────────────
// updateProblemStatus
// ─────────────────────────────────────────────
 
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
// Schema
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

export type UpdateProblemRevisitInput = z.infer<typeof UpdateProblemRevisitInputSchema>;
export type UpdateProblemRevisitResult = z.infer<typeof UpdateProblemRevisitResultSchema>;

// ─────────────────────────────────────────────
// updateProblemRevisit
// ─────────────────────────────────────────────

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
