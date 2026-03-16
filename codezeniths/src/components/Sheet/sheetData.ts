// sheetData.ts

export interface SheetCardData {
  title: string;
  slug: string;
  description: string;
  targetGroup: string;
  order: number;
  totalProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
}

export const sheetCards: SheetCardData[] = [
  {
    title: "Codezeniths Core",
    slug: "codezeniths-core",
    description:
      "600 handpicked problems — complete beginner roadmap from basics to advanced DSA patterns. Ideal first roadmap for college students and absolute beginners.",
    targetGroup: "Beginner",
    order: 1,
    totalProblems: 600,
    easyProblems: 120,
    mediumProblems: 150,
    hardProblems: 80,
  },

  {
    title: "Codezeniths Intermediate",
    slug: "codezeniths-intermediate",
    description:
      "450 medium-to-hard problems focused on advanced patterns, optimization, and top-company question styles. Perfect next step after Core.",
    targetGroup: "Intermediate",
    order: 2,
    totalProblems: 450,
    easyProblems: 40,
    mediumProblems: 220,
    hardProblems: 190,
  },

  {
    title: "Codezeniths Advanced",
    slug: "codezeniths-advanced",
    description:
      "350 elite-level problems targeting high contest ratings and top-tier interviews. Heavy on hard DP, graphs, math, and constructive algorithms.",
    targetGroup: "Advanced",
    order: 3,
    totalProblems: 350,
    easyProblems: 10,
    mediumProblems: 90,
    hardProblems: 250,
  },

  {
    title: "Codezeniths Contest Sprint",
    slug: "codezeniths-contest-sprint",
    description:
      "Fast 250-problem sprint to sharpen contest speed and accuracy. Great for last-minute preparation before important contests or placements.",
    targetGroup: "Contest-focused",
    order: 4,
    totalProblems: 250,
    easyProblems: 20,
    mediumProblems: 110,
    hardProblems: 120,
  },

  {
    title: "Codezeniths Company Wise",
    slug: "codezeniths-company-wise",
    description:
      "480+ most repeated problems at FAANG & top product companies, grouped by company and topic. Includes recent interview & contest questions.",
    targetGroup: "Interview",
    order: 5,
    totalProblems: 480,
    easyProblems: 80,
    mediumProblems: 280,
    hardProblems: 120,
  },

  {
    title: "Codezeniths Master Collection",
    slug: "codezeniths-master",
    description:
      "800+ highest-quality problems from LeetCode, Codeforces, AtCoder & more. Long-term reference & revision list for serious CP and SDE aspirants.",
    targetGroup: "All levels",
    order: 6,
    totalProblems: 800,
    easyProblems: 150,
    mediumProblems: 350,
    hardProblems: 300,
  },
];