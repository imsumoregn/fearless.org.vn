import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, projectLikes } from "@/db/schema";
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

    // Check if already liked
    const [existingLike] = await db
      .select()
      .from(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, projectId),
          eq(projectLikes.userId, userId)
        )
      )
      .limit(1);

    if (existingLike) {
      return NextResponse.json({ message: "Already liked" });
    }

    // Create like
    await db.insert(projectLikes).values({
      projectId,
      userId,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error liking project:", error);
    return NextResponse.json(
      { error: "Failed to like project" },
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
      .delete(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, projectId),
          eq(projectLikes.userId, userId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unliking project:", error);
    return NextResponse.json(
      { error: "Failed to unlike project" },
      { status: 500 }
    );
  }
}

