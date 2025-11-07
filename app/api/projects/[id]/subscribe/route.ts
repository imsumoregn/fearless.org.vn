import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, projectSubscriptions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

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

    // Check if already subscribed
    const [existingSub] = await db
      .select()
      .from(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.projectId, projectId),
          eq(projectSubscriptions.userId, userId)
        )
      )
      .limit(1);

    if (existingSub) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    // Create subscription
    await db.insert(projectSubscriptions).values({
      projectId,
      userId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to project:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to project" },
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
    const projectId = parseInt(id);

    await db
      .delete(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.projectId, projectId),
          eq(projectSubscriptions.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsubscribing from project:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from project" },
      { status: 500 }
    );
  }
}

