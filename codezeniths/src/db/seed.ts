// seed.ts
import {prisma} from './prisma.client';
import { Difficulty } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

interface ProblemData {
  title: string;
  slug: string;
  content?: string;
  difficulty: string;
  leetcodeUrl?: string;
  articleUrl?: string;
  // ignore defaultCode, editorial, topics array, etc.
}

interface SubTopicInput {
  title: string;
  slug: string;
  order: number;
  problems: string[];  // problem slugs
}

interface TopicInput {
  title: string;
  slug: string;
  order: number;
  subTopics: SubTopicInput[];
}

interface SheetInput {
  // we only care about this field
  topics: TopicInput[];
  // ignore title, slug, description, targetGroup, order, hasSubTopics
}

async function main() {
  console.log('🚀 Seeding Codezeniths Core topics & problems (single sheet object)');

  // ───────────────────────────────────────────────
  // 1. Load & seed problems
  // ───────────────────────────────────────────────
  const problemsPath = path.join(process.cwd(), 'problems.json');
  let problemsData: ProblemData[] = [];

  try {
    const raw = await fs.readFile(problemsPath, 'utf-8');
    problemsData = JSON.parse(raw);
  } catch (err) {
    console.error('Cannot read problems.json:', err);
    process.exit(1);
  }

  const problemMap = new Map<string, string>(); // slug → id

  for (const p of problemsData) {
    const diffStr = (p.difficulty || 'Easy').toUpperCase();
    const difficulty = diffStr in Difficulty ? diffStr as Difficulty : Difficulty.EASY;

    const problem = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        content: p.content ?? null,
        difficulty,
        leetcodeUrl: p.leetcodeUrl ?? null,
        articleUrl: p.articleUrl ?? null,
      },
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content ?? null,
        difficulty,
        leetcodeUrl: p.leetcodeUrl ?? null,
        articleUrl: p.articleUrl ?? null,
      },
    });

    problemMap.set(p.slug, problem.id);
  }

  console.log(`→ ${problemsData.length} problems upserted`);

  // ───────────────────────────────────────────────
  // 2. Clean previous hierarchy (safe to re-run)
  // ───────────────────────────────────────────────
  await prisma.topicProblem.deleteMany({});
  await prisma.subTopic.deleteMany({});
  await prisma.topic.deleteMany({});

  console.log('→ Cleared existing topics / subtopics / links');

  // ───────────────────────────────────────────────
  // 3. Load single sheet object & use its topics
  // ───────────────────────────────────────────────
  const sheetPath = path.join(process.cwd(), 'sheets.json');
  let sheetData: SheetInput;

  try {
    const raw = await fs.readFile(sheetPath, 'utf-8');
    sheetData = JSON.parse(raw);
  } catch (err) {
    console.error('Cannot read sheets.json:', err);
    process.exit(1);
  }

  if (!sheetData.topics || !Array.isArray(sheetData.topics)) {
    console.error('sheets.json does not contain a valid "topics" array');
    process.exit(1);
  }

  const topicsInput = sheetData.topics;

  let topicCount = 0;
  let subTopicCount = 0;
  let linkCount = 0;

  for (const topicInput of topicsInput) {
    const topic = await prisma.topic.upsert({
      where: { slug: topicInput.slug },
      update: {
        title: topicInput.title,
        order: topicInput.order,
      },
      create: {
        title: topicInput.title,
        slug: topicInput.slug,
        order: topicInput.order,
      },
    });

    topicCount++;

    for (const subInput of topicInput.subTopics || []) {
      const subTopic = await prisma.subTopic.upsert({
        where: {
          topicId_slug: {
            topicId: topic.id,
            slug: subInput.slug,
          },
        },
        update: {
          title: subInput.title,
          order: subInput.order,
        },
        create: {
          topicId: topic.id,
          title: subInput.title,
          slug: subInput.slug,
          order: subInput.order,
        },
      });

      subTopicCount++;

      // Link problems in order
      const slugs = subInput.problems || [];

      for (let i = 0; i < slugs.length; i++) {
        const slug = slugs[i];
        const problemId = problemMap.get(slug);

        if (!problemId) {
          console.warn(`Missing problem: ${slug}  (in ${topic.slug} → ${subTopic.slug})`);
          continue;
        }

        await prisma.topicProblem.upsert({
          where: {
            topicId_subTopicId_problemId: {
              topicId: topic.id,
              subTopicId: subTopic.id,
              problemId,
            },
          },
          update: { order: i + 1 },
          create: {
            topicId: topic.id,
            subTopicId: subTopic.id,
            problemId,
            order: i + 1,
          },
        });

        linkCount++;
      }
    }
  }

  console.log('\n✅ Done');
  console.log(`  Topics created/updated:     ${topicCount}`);
  console.log(`  Sub-topics:                 ${subTopicCount}`);
  console.log(`  Problem ↔ SubTopic links:   ${linkCount}`);
}

main()
  .catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });