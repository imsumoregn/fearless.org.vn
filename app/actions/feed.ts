"use server";

import { db } from "@/db";
import { projects, projectFeedItems, projectSubscriptions } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFeedItems(projectId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if project exists
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
  }

  const feedItems = await db
    .select()
    .from(projectFeedItems)
    .where(eq(projectFeedItems.projectId, projectId))
    .orderBy(desc(projectFeedItems.createdAt));

  return feedItems;
}

export async function createFeedItem(projectId: number, content: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if project exists
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    throw new Error("Project not found");
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
    throw new Error("You must be subscribed to add feed items");
  }

  if (!content || !content.trim()) {
    throw new Error("Content is required");
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

  revalidatePath(`/projects/${projectId}`);
  return feedItem;
}

export async function deleteFeedItem(projectId: number, feedItemId: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [deletedItem] = await db
    .delete(projectFeedItems)
    .where(
      and(
        eq(projectFeedItems.id, feedItemId),
        eq(projectFeedItems.projectId, projectId),
        eq(projectFeedItems.authorId, userId)
      )
    )
    .returning();

  if (!deletedItem) {
    throw new Error("Feed item not found or unauthorized");
  }

  revalidatePath(`/projects/${projectId}`);
  return deletedItem;
}
