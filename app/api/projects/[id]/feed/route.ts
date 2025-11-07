import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, projectFeedItems, projectSubscriptions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";

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
    const projectId = parseInt(id);

    // Check if project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const feedItems = await db
      .select()
      .from(projectFeedItems)
      .where(eq(projectFeedItems.projectId, projectId))
      .orderBy(desc(projectFeedItems.createdAt));

    return NextResponse.json(feedItems);
  } catch (error) {
    console.error("Error fetching feed items:", error);
    return NextResponse.json(
      { error: "Failed to fetch feed items" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    // Check if project exists
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user is subscribed
    const [subscription] = await db
      .select()
      .from(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.projectId, projectId),
          eq(projectSubscriptions.userId, userId)
        )
      )
      .limit(1);

    if (!subscription) {
      return NextResponse.json(
        { error: "You must be subscribed to add feed items" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const [feedItem] = await db
      .insert(projectFeedItems)
      .values({
        projectId,
        authorId: userId,
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(feedItem, { status: 201 });
  } catch (error) {
    console.error("Error creating feed item:", error);
    return NextResponse.json(
      { error: "Failed to create feed item" },
      { status: 500 }
    );
  }
}

