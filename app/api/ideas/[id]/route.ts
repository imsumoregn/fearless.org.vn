import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = parseInt(id);

    const [idea] = await db
      .select()
      .from(projectIdeas)
      .where(eq(projectIdeas.id, ideaId))
      .limit(1);

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error("Error fetching idea:", error);
    return NextResponse.json(
      { error: "Failed to fetch idea" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = parseInt(id);

    const [existingIdea] = await db
      .select()
      .from(projectIdeas)
      .where(eq(projectIdeas.id, ideaId))
      .limit(1);

    if (!existingIdea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (existingIdea.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own ideas" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, authors, location, pitchDeck, estimatedResources } =
      body;

    const [updatedIdea] = await db
      .update(projectIdeas)
      .set({
        title: title || existingIdea.title,
        summary: summary || existingIdea.summary,
        authors: authors || existingIdea.authors,
        location: location !== undefined ? location : existingIdea.location,
        pitchDeck:
          pitchDeck !== undefined ? pitchDeck : existingIdea.pitchDeck,
        estimatedResources:
          estimatedResources !== undefined
            ? estimatedResources
            : existingIdea.estimatedResources,
        updatedAt: new Date(),
      })
      .where(eq(projectIdeas.id, ideaId))
      .returning();

    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error("Error updating idea:", error);
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const ideaId = parseInt(id);

    const [existingIdea] = await db
      .select()
      .from(projectIdeas)
      .where(eq(projectIdeas.id, ideaId))
      .limit(1);

    if (!existingIdea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    if (existingIdea.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own ideas" },
        { status: 403 }
      );
    }

    await db.delete(projectIdeas).where(eq(projectIdeas.id, ideaId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting idea:", error);
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    );
  }
}

