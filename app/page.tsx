import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import {
    projects,
    projectIdeas,
    projectLikes,
    projectSubscriptions,
} from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectIdeaCard } from "./components/ProjectIdeaCard";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

async function getProjects(limit: number = 5) {
    const { userId } = await auth();
    const results = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.createdAt))
        .limit(limit);

    if (!userId) {
        return results.map((p) => ({
            ...p,
            likes: [],
            subscriptions: [],
            _count: { likes: 0, subscriptions: 0 },
        }));
    }

    // Get likes and subscriptions for current user
    const projectsWithUserData = await Promise.all(
        results.map(async (project) => {
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
                            eq(projectLikes.userId, userId),
                        ),
                    )
                    .limit(1),
                db
                    .select()
                    .from(projectSubscriptions)
                    .where(
                        and(
                            eq(projectSubscriptions.projectId, project.id),
                            eq(projectSubscriptions.userId, userId),
                        ),
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
        }),
    );

    return projectsWithUserData;
}

async function getProjectIdeas(limit: number = 5) {
    const results = await db
        .select()
        .from(projectIdeas)
        .orderBy(desc(projectIdeas.createdAt))
        .limit(limit);

    return results;
}

export default async function Home() {
    const { userId } = await auth();
    const recentProjects = await getProjects(5);
    const recentIdeas = await getProjectIdeas(5);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
                            Fearless
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                            Share your ideas and join community projects that
                            make a difference
                        </p>
                        <SignedOut>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/sign-in"
                                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 font-medium"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex gap-4 justify-center">
                                <Link
                                    href="/projects/submit"
                                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 font-medium"
                                >
                                    Submit a Project
                                </Link>
                                <Link
                                    href="/ideas/submit"
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                                >
                                    Share an Idea
                                </Link>
                            </div>
                        </SignedIn>
                    </div>
                </div>
            </section>

            {/* Active Projects Section */}
            <section className="py-16 container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif font-semibold">
                        Active Projects
                    </h2>
                    <SignedIn>
                        <Link
                            href="/projects"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                        >
                            View All →
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <span className="text-sm text-gray-500">
                            Sign in to view full list
                        </span>
                    </SignedOut>
                </div>
                {recentProjects.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                        No projects yet. Be the first to submit one!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                currentUserId={userId || undefined}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Project Ideas Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900 container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-serif font-semibold">
                        Project Ideas
                    </h2>
                    <SignedIn>
                        <Link
                            href="/ideas"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
                        >
                            View All →
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <span className="text-sm text-gray-500">
                            Sign in to view full list
                        </span>
                    </SignedOut>
                </div>
                {recentIdeas.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                        No ideas yet. Share your first idea!
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentIdeas.map((idea) => (
                            <ProjectIdeaCard key={idea.id} idea={idea} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
