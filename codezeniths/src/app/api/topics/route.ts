import { NextResponse } from "next/server";
import { getAllTopics } from "@/db/queries";

// GET /api/topics
export async function GET() {
  try {
    const topics = await getAllTopics();
    return NextResponse.json(topics);
  } catch (error) {
    console.error("[GET /api/topics]", error);
    return NextResponse.json(
      { error: "Failed to fetch topics." },
      { status: 500 }
    );
  }
}