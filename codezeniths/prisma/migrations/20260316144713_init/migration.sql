-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "problem" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "difficulty" "Difficulty" NOT NULL,
    "leetcodeUrl" TEXT,
    "articleUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_topic" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "sheet_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_sub_topic" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "sheet_sub_topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sheet_problem" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "subTopicId" UUID NOT NULL,
    "problemId" UUID NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "sheet_problem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "problem_slug_key" ON "problem"("slug");

-- CreateIndex
CREATE INDEX "problem_difficulty_slug_idx" ON "problem"("difficulty", "slug");

-- CreateIndex
CREATE INDEX "sheet_topic_order_idx" ON "sheet_topic"("order");

-- CreateIndex
CREATE UNIQUE INDEX "sheet_topic_slug_key" ON "sheet_topic"("slug");

-- CreateIndex
CREATE INDEX "sheet_sub_topic_topicId_order_idx" ON "sheet_sub_topic"("topicId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "sheet_sub_topic_topicId_slug_key" ON "sheet_sub_topic"("topicId", "slug");

-- CreateIndex
CREATE INDEX "sheet_problem_order_idx" ON "sheet_problem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "sheet_problem_topicId_subTopicId_problemId_key" ON "sheet_problem"("topicId", "subTopicId", "problemId");

-- AddForeignKey
ALTER TABLE "sheet_sub_topic" ADD CONSTRAINT "sheet_sub_topic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "sheet_topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_problem" ADD CONSTRAINT "sheet_problem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "sheet_topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_problem" ADD CONSTRAINT "sheet_problem_subTopicId_fkey" FOREIGN KEY ("subTopicId") REFERENCES "sheet_sub_topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sheet_problem" ADD CONSTRAINT "sheet_problem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
