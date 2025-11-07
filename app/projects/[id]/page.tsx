import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  projects,
  projectLikes,
  projectSubscriptions,
  projectFeedItems,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { LikeButton } from "../../components/LikeButton";
import { SubscribeButton } from "../../components/SubscribeButton";
import { FeedSection } from "../../components/FeedSection";
import Link from "next/link";

async function getProject(id: number) {
  const { userId } = await auth();
  if (!userId) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);

  if (!project) return null;

  const [allLikes, allSubs, userLike, userSub, feedItems] = await Promise.all([
    db
      .select()
      .from(projectLikes)
      .where(eq(projectLikes.projectId, id)),
    db
      .select()
      .from(projectSubscriptions)
      .where(eq(projectSubscriptions.projectId, id)),
    db
      .select()
      .from(projectLikes)
      .where(
        and(
          eq(projectLikes.projectId, id),
          eq(projectLikes.userId, userId)
        )
      )
      .limit(1),
    db
      .select()
      .from(projectSubscriptions)
      .where(
        and(
          eq(projectSubscriptions.projectId, id),
          eq(projectSubscriptions.userId, userId)
        )
      )
      .limit(1),
    db
      .select()
      .from(projectFeedItems)
      .where(eq(projectFeedItems.projectId, id))
      .orderBy(desc(projectFeedItems.createdAt)),
  ]);

  return {
    project,
    likes: allLikes,
    subscriptions: allSubs,
    userLike: userLike[0] || null,
    userSub: userSub[0] || null,
    feedItems,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const projectId = parseInt(id);
  const data = await getProject(projectId);

  if (!data || !data.project) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-gray-500 dark:text-gray-400">Project not found</p>
        <Link href="/projects" className="text-blue-600 hover:underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const { project, likes, subscriptions, userLike, userSub, feedItems } = data;
  const isLiked = !!userLike;
  const isSubscribed = !!userSub;
  const likeCount = likes.length;
  const subscriptionCount = subscriptions.length;
  let authors: string | string[];
  try {
    authors = JSON.parse(project.authors || "[]");
  } catch {
    authors = project.authors || "";
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link
        href="/projects"
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 inline-block"
      >
        ← Back to Projects
      </Link>

      <article>
        <h1 className="text-4xl font-serif font-bold mb-4">{project.title}</h1>

        <div className="flex items-center gap-4 mb-6">
          <LikeButton
            projectId={project.id}
            initialLiked={isLiked}
            initialCount={likeCount}
          />
          <SubscribeButton
            projectId={project.id}
            initialSubscribed={isSubscribed}
            initialCount={subscriptionCount}
          />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {project.summary}
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 mb-8">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="font-semibold mb-1">Authors</dt>
              <dd className="text-gray-600 dark:text-gray-400">
                {Array.isArray(authors) ? authors.join(", ") : authors}
              </dd>
            </div>
            {project.location && (
              <div>
                <dt className="font-semibold mb-1">Location</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  {project.location}
                </dd>
              </div>
            )}
            {project.pitchDeck && (
              <div>
                <dt className="font-semibold mb-1">Pitch Deck</dt>
                <dd className="text-gray-600 dark:text-gray-400">
                  <a
                    href={project.pitchDeck}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Pitch Deck
                  </a>
                </dd>
              </div>
            )}
            {project.estimatedResources && (
              <div>
                <dt className="font-semibold mb-1">Estimated Resources</dt>
                <dd className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {project.estimatedResources}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <FeedSection
          projectId={project.id}
          feedItems={feedItems}
          currentUserId={userId}
          isSubscribed={isSubscribed}
        />
      </article>
    </div>
  );
}

