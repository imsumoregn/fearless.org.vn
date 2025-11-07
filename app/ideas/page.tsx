import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { desc } from "drizzle-orm";
import { ProjectIdeaCard } from "../components/ProjectIdeaCard";
import Link from "next/link";

async function getAllIdeas() {
  const allIdeas = await db
    .select()
    .from(projectIdeas)
    .orderBy(desc(projectIdeas.createdAt));

  return allIdeas;
}

export default async function IdeasPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const allIdeas = await getAllIdeas();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold">Project Ideas</h1>
        <Link
          href="/ideas/submit"
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 font-medium"
        >
          Share an Idea
        </Link>
      </div>
      {allIdeas.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">
          No ideas yet. Share your first idea!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allIdeas.map((idea) => (
            <ProjectIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

