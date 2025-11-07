import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProjectForm } from "../../../components/ProjectForm";
import Link from "next/link";

async function getIdea(id: number) {
  const [idea] = await db
    .select()
    .from(projectIdeas)
    .where(eq(projectIdeas.id, id))
    .limit(1);

  return idea;
}

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const ideaId = parseInt(id);
  const idea = await getIdea(ideaId);

  if (!idea) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-500 dark:text-gray-400">Idea not found</p>
        <Link href="/ideas" className="text-blue-600 hover:underline">
          Back to Ideas
        </Link>
      </div>
    );
  }

  if (idea.authorId !== userId) {
    redirect("/ideas");
  }

  let authors: string | string[];
  try {
    authors = JSON.parse(idea.authors || "[]");
  } catch {
    authors = idea.authors || "";
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Edit Idea</h1>
      <ProjectForm
        type="idea"
        initialData={{
          id: idea.id,
          title: idea.title,
          summary: idea.summary,
          authors: Array.isArray(authors) ? authors.join(", ") : authors,
          location: idea.location || "",
          pitchDeck: idea.pitchDeck || "",
          estimatedResources: idea.estimatedResources || "",
        }}
      />
    </div>
  );
}

