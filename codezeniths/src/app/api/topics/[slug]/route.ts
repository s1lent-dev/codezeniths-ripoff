import { NextResponse } from "next/server";
import { getSingleTopic } from "@/db/queries";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/topics/:slug
export async function GET(_req: Request, { params }: RouteParams) {
  const { slug } = await params;

  try {
    const topic = await getSingleTopic(slug);

    if (!topic) {
      return NextResponse.json(
        { error: `Topic "${slug}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(topic);
  } catch (error) {
    console.error(`[GET /api/topics/${slug}]`, error);
    return NextResponse.json(
      { error: "Failed to fetch topic." },
      { status: 500 }
    );
  }
}