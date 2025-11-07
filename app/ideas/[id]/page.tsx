import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projectIdeas } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { DeleteIdeaButton } from "../../components/DeleteIdeaButton";

async function getIdea(id: number) {
  const [idea] = await db
    .select()
    .from(projectIdeas)
    .where(eq(projectIdeas.id, id))
    .limit(1);

  return idea;
}

export default async function IdeaDetailPage({
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

  let authors: string | string[];
  try {
    authors = JSON.parse(idea.authors || "[]");
  } catch {
    authors = idea.authors || "";
  }
  const isAuthor = idea.authorId === userId;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link
        href="/ideas"
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 inline-block"
      >
        ← Back to Ideas
      </Link>

      <article>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-serif font-bold">{idea.title}</h1>
          {isAuthor && (
            <div className="flex gap-2">
              <Link
                href={`/ideas/${idea.id}/edit`}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Edit
              </Link>
              <DeleteIdeaButton ideaId={idea.id} />
            </div>
          )}
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {idea.summary}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-semibold mb-1">Authors</dt>
              <dd className="text-gray-600 dark:text-gray-400">
                {Array.isArray(authors) ? authors.join(", ") : authors}
              </dd>
            </div>
            {idea.location && (
              <div>
                <dt className="font-semibold mb-1">Location</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  {idea.location}
                </dd>
              </div>
            )}
            {idea.pitchDeck && (
              <div>
                <dt className="font-semibold mb-1">Pitch Deck</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  <a
                    href={idea.pitchDeck}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Pitch Deck
                  </a>
                </dd>
              </div>
            )}
            {idea.estimatedResources && (
              <div>
                <dt className="font-semibold mb-1">Estimated Resources</dt>
                <dd className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {idea.estimatedResources}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </article>
    </div>
  );
}

