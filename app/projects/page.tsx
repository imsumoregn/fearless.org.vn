import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { projects, projectLikes, projectSubscriptions } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { ProjectCard } from "../components/ProjectCard";
import Link from "next/link";

async function getAllProjects() {
  const { userId } = await auth();
  if (!userId) return [];

  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt));

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

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const allProjects = await getAllProjects();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold">All Projects</h1>
        <Link
          href="/projects/submit"
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 font-medium"
        >
          Submit a Project
        </Link>
      </div>
      {allProjects.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic">
          No projects yet. Be the first to submit one!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

