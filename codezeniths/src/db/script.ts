import { Level } from "@prisma/client";
import { prisma } from "./prisma.client";

// ─────────────────────────────────────────────
// Topic metadata
// ─────────────────────────────────────────────

const topicData: Record<string, { description: string; level: Level }> = {
  "arrays-strings": {
    level: Level.FUNDAMENTAL,
    description:
      "Covers contiguous memory structures, character sequences, hash maps for frequency counting, and 2D matrices. You'll learn in-place manipulation, string pattern problems, and using hash tables to trade space for time.",
  },
  "prefix-sum-intervals": {
    level: Level.FUNDAMENTAL,
    description:
      "Two complementary ideas: prefix sums precompute running totals for O(1) range queries, while interval problems require merging, inserting, and querying overlapping ranges. Together they handle the majority of subarray and scheduling problems.",
  },
  "two-pointers": {
    level: Level.FUNDAMENTAL,
    description:
      "Place pointers at strategic positions and move them based on a condition to avoid nested loops. Used for pair-sum problems on sorted arrays, partitioning, deduplication, and checking palindromes — all in linear time.",
  },
  "sliding-window": {
    level: Level.FUNDAMENTAL,
    description:
      "Maintain a variable-size window over a sequence, expanding or shrinking it to track a running aggregate. The standard technique for longest or shortest subarray problems with sum, character, or frequency constraints.",
  },
  "binary-search": {
    level: Level.FUNDAMENTAL,
    description:
      "Eliminate half the search space per step for O(log n) lookups. Applies to classic sorted-array searches but extends to rotated arrays, 2D matrices, and 'search on answer' — where you binary search a numeric range to find a minimum feasible value.",
  },
  "linked-list": {
    level: Level.INTERMEDIATE,
    description:
      "Pointer-based linear structures with O(1) insert and delete but no random access. Core techniques are in-place reversal, cycle detection with fast-slow pointers, merging sorted lists, and finding the middle node in one pass.",
  },
  "stack-queue": {
    level: Level.INTERMEDIATE,
    description:
      "Stacks, queues, and deques as abstract ordering tools, plus monotonic variants that maintain a sorted invariant across a window. Together they solve bracket matching, next-greater-element, sliding-window maximum, and BFS-level-order traversal.",
  },
  "greedy": {
    level: Level.INTERMEDIATE,
    description:
      "Commit to the locally best option at each step without backtracking. Correct when a global optimum can be assembled from independent local choices — typical in interval scheduling, jump games, task assignment, and minimum-cost covering problems.",
  },
  "bit-manipulation": {
    level: Level.INTERMEDIATE,
    description:
      "Operate directly on the binary representation of integers. XOR cancels duplicates, bit masks represent subsets, and shifts replace powers-of-two arithmetic. Enables O(1) tricks for counting set bits, isolating the lowest set bit, and generating all subsets.",
  },
  "recursion-backtracking": {
    level: Level.INTERMEDIATE,
    description:
      "Recursion decomposes a problem into identical subproblems and is the basis for divide-and-conquer. Backtracking extends this by building a solution incrementally, pruning any partial candidate the moment it violates a constraint — essential for permutations, combinations, subsets, and puzzles like N-Queens and Sudoku.",
  },
  "tree": {
    level: Level.INTERMEDIATE,
    description:
      "Hierarchical structures spanning binary trees, N-ary trees, and BSTs through to self-balancing trees like AVL and Red-Black. Problems cover DFS and BFS traversal, path sums, lowest common ancestor, BST operations, and the height and diameter of arbitrary trees.",
  },
  "heap": {
    level: Level.INTERMEDIATE,
    description:
      "A complete binary tree whose root is always the minimum or maximum, giving O(log n) insert and extract. The natural structure for streaming top-K queries, merging K sorted lists, median maintenance with two heaps, and priority-based scheduling.",
  },
  "graph": {
    level: Level.ADVANCED,
    description:
      "General networks of nodes and edges, directed or undirected, weighted or unweighted. Core algorithms include BFS for shortest unweighted paths, Dijkstra for weighted graphs, topological sort for dependency ordering, and Union-Find for connected components and cycle detection.",
  },
  "dynamic-programming": {
    level: Level.ADVANCED,
    description:
      "Break a problem into overlapping subproblems and cache each result so it is computed only once. Covers 1D sequence DP, 2D grid DP, interval DP, knapsack variants, bitmask DP over subsets, and state-machine DP — the most heavily tested advanced category in interviews.",
  },
  "advanced-topics": {
    level: Level.ADVANCED,
    description:
      "Specialised data structures and algorithms beyond the standard curriculum: tries for prefix and dictionary lookup, segment trees for range queries with point or range updates, and algorithmic techniques such as line sweep, meet-in-the-middle, Mo's algorithm, and string matching with KMP and Z-function.",
  },
};

// ─────────────────────────────────────────────
// Seed
// ─────────────────────────────────────────────

async function main() {
  let updated = 0;
  let notFound = 0;

  for (const [slug, { description, level }] of Object.entries(topicData)) {
    const result = await prisma.topic.updateMany({
      where: { slug },
      data: { description, level },
    });

    if (result.count > 0) {
      updated++;
      console.log(`✅  ${slug} → ${level}`);
    } else {
      notFound++;
      console.warn(`⚠️  Not found: ${slug}`);
    }
  }

  console.log(`\nDone — ${updated} updated, ${notFound} not found.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });