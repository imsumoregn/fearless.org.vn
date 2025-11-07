"use server";

import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type IdeaFormData = {
    title: string;
    summary: string;
    authors: string;
    location?: string;
    pitchDeck?: string;
    estimatedResources?: string;
};

export async function getIdeas() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const allIdeas = await db
        .select()
        .from(projectIdeas)
        .orderBy(desc(projectIdeas.createdAt));

    return allIdeas;
}

export async function createIdea(formData: IdeaFormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const { title, summary, authors, location, pitchDeck, estimatedResources } =
        formData;

    if (!title || !summary || !authors) {
        throw new Error("Title, summary, and authors are required");
    }

    await db
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

    revalidatePath("/ideas");
    redirect("/ideas");
}

export async function updateIdea(ideaId: number, formData: IdeaFormData) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const { title, summary, authors, location, pitchDeck, estimatedResources } =
        formData;

    if (!title || !summary || !authors) {
        throw new Error("Title, summary, and authors are required");
    }

    const [idea] = await db
        .update(projectIdeas)
        .set({
            title,
            summary,
            authors,
            location: location || null,
            pitchDeck: pitchDeck || null,
            estimatedResources: estimatedResources || null,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(projectIdeas.id, Number(ideaId)),
                eq(projectIdeas.authorId, userId),
            ),
        )
        .returning();

    if (!idea) {
        throw new Error("Idea not found or unauthorized");
    }

    revalidatePath("/ideas");
    revalidatePath(`/ideas/${ideaId}`);
    redirect("/ideas");
}

export async function deleteIdea(ideaId: number) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const [deletedIdea] = await db
        .delete(projectIdeas)
        .where(
            and(
                eq(projectIdeas.id, Number(ideaId)),
                eq(projectIdeas.authorId, userId),
            ),
        )
        .returning();

    if (!deletedIdea) {
        throw new Error("Idea not found or unauthorized");
    }

    revalidatePath("/ideas");
    redirect("/ideas");
}
