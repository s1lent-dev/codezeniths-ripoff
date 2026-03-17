"use server";

import { Status } from "@prisma/client";
import { updateProblemStatus, updateProblemRevisit } from "@/db/queries";

// ─────────────────────────────────────────────
// updateProblemStatusAction
// ─────────────────────────────────────────────

export async function updateProblemStatusAction(
  slug: string,
  status: Status
) {
  return await updateProblemStatus({ slug, status });
}

// ─────────────────────────────────────────────
// updateProblemRevisitAction
// ─────────────────────────────────────────────

export async function updateProblemRevisitAction(
  slug: string,
  revisit: boolean
) {
  return await updateProblemRevisit({ slug, revisit });
}