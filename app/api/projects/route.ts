import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { projects, projectLikes, projectSubscriptions } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));

    // Get counts and user-specific data for each project
    const projectsWithCounts = await Promise.all(
      allProjects.map(async (project) => {
        const [allLikes, allSubs, userLike, userSub] = await Promise.all([
          db
            .select()
            .from(projectLikes)
            .where(eq(projectLikes.projectId, project.id)),
          db
            .select()
            .from(projectSubscriptions)
            .where(eq(projectSubscriptions.projectId, project.id)),
          db
            .select()
            .from(projectLikes)
            .where(
              and(
                eq(projectLikes.projectId, project.id),
                eq(projectLikes.userId, userId)
              )
            )
            .limit(1),
          db
            .select()
            .from(projectSubscriptions)
            .where(
              and(
                eq(projectSubscriptions.projectId, project.id),
                eq(projectSubscriptions.userId, userId)
              )
            )
            .limit(1),
        ]);

        return {
          ...project,
          _count: {
            likes: allLikes.length,
            subscriptions: allSubs.length,
          },
          likes: userLike,
          subscriptions: userSub,
        };
      })
    );

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
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

    const [project] = await db
      .insert(projects)
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

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

