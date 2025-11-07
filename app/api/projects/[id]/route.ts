import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
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
    const projectId = parseInt(id);

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
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
    const projectId = parseInt(id);

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existingProject.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only edit your own projects" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, summary, authors, location, pitchDeck, estimatedResources } =
      body;

    const [updatedProject] = await db
      .update(projects)
      .set({
        title: title || existingProject.title,
        summary: summary || existingProject.summary,
        authors: authors || existingProject.authors,
        location: location !== undefined ? location : existingProject.location,
        pitchDeck:
          pitchDeck !== undefined ? pitchDeck : existingProject.pitchDeck,
        estimatedResources:
          estimatedResources !== undefined
            ? estimatedResources
            : existingProject.estimatedResources,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
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

    const [existingProject] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existingProject.authorId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own projects" },
        { status: 403 }
      );
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

