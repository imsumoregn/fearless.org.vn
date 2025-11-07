import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allIdeas = await db
      .select()
      .from(projectIdeas)
      .orderBy(desc(projectIdeas.createdAt));

    return NextResponse.json(allIdeas);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, summary, authors, location, pitchDeck, estimatedResources } =
      body;

    if (!title || !summary || !authors) {
      return NextResponse.json(
        { error: "Title, summary, and authors are required" },
        { status: 400 }
      );
    }

    const [idea] = await db
      .insert(projectIdeas)
      .values({
        title,
        summary,
        authors,
        location: location || null,
        pitchDeck: pitchDeck || null,
        estimatedResources: estimatedResources || null,
        authorId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error("Error creating idea:", error);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }
}

