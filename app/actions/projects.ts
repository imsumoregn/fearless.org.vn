"use server";

import { db } from "@/db";
import { projects, projectLikes, projectSubscriptions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ProjectFormData = {
  title: string;
  summary: string;
  authors: string;
  location?: string;
  pitchDeck?: string;
  estimatedResources?: string;
};

export async function getProjects() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
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

  return projectsWithCounts;
}

export async function createProject(formData: ProjectFormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, summary, authors, location, pitchDeck, estimatedResources } =
    formData;

  if (!title || !summary || !authors) {
    throw new Error("Title, summary, and authors are required");
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

  revalidatePath("/projects");
  redirect("/projects");
}

export async function updateProject(
  projectId: string,
  formData: ProjectFormData
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { title, summary, authors, location, pitchDeck, estimatedResources } =
    formData;

  if (!title || !summary || !authors) {
    throw new Error("Title, summary, and authors are required");
  }

  const [project] = await db
    .update(projects)
    .set({
      title,
      summary,
      authors,
      location: location || null,
      pitchDeck: pitchDeck || null,
      estimatedResources: estimatedResources || null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, projectId), eq(projects.authorId, userId)))
    .returning();

  if (!project) {
    throw new Error("Project not found or unauthorized");
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect("/projects");
}

export async function deleteProject(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [deletedProject] = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.authorId, userId)))
    .returning();

  if (!deletedProject) {
    throw new Error("Project not found or unauthorized");
  }

  revalidatePath("/projects");
  redirect("/projects");
}

export async function toggleProjectLike(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingLike = await db
    .select()
    .from(projectLikes)
    .where(
      and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId))
    )
    .limit(1);

  if (existingLike.length > 0) {
    await db
      .delete(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, projectId),
          eq(projectLikes.userId, userId)
        )
      );
  } else {
    await db.insert(projectLikes).values({
      projectId,
      userId,
      createdAt: new Date(),
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function toggleProjectSubscription(projectId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existingSub = await db
    .select()
    .from(projectSubscriptions)
    .where(
      and(
        eq(projectSubscriptions.projectId, projectId),
        eq(projectSubscriptions.userId, userId)
      )
    )
    .limit(1);

  if (existingSub.length > 0) {
    await db
      .delete(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.projectId, projectId),
          eq(projectSubscriptions.userId, userId)
        )
      );
  } else {
    await db.insert(projectSubscriptions).values({
      projectId,
      userId,
      createdAt: new Date(),
    });
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}
