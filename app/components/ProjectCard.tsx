import Link from "next/link";
import { LikeButton } from "./LikeButton";
import { SubscribeButton } from "./SubscribeButton";

type Project = {
    id: number;
    title: string;
    summary: string;
    authors: string;
    location: string | null;
    authorId: string;
    createdAt: Date;
    _count?: {
        likes: number;
        subscriptions: number;
    };
    likes?: Array<{ userId: string }>;
    subscriptions?: Array<{ userId: string }>;
};

type ProjectCardProps = {
    project: Project;
    currentUserId?: string;
};

export function ProjectCard({ project, currentUserId }: ProjectCardProps) {
    const isLiked = currentUserId
        ? project.likes?.some((like) => like.userId === currentUserId)
        : false;
    const isSubscribed = currentUserId
        ? project.subscriptions?.some((sub) => sub.userId === currentUserId)
        : false;
    const likeCount = project._count?.likes || project.likes?.length || 0;
    const subscriptionCount =
        project._count?.subscriptions || project.subscriptions?.length || 0;

    let authors: string | string[];
    try {
        authors = JSON.parse(project.authors || "[]");
    } catch {
        authors = project.authors || "";
    }

    return (
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Link href={`/projects/${project.id}`}>
                <h3 className="text-xl font-serif font-semibold mb-2 hover:underline">
                    {project.title}
                </h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {project.summary}
            </p>
            <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Authors:</span>
                <span>
                    {Array.isArray(authors) ? authors.join(", ") : authors}
                </span>
                {project.location && (
                    <>
                        <span className="mx-2">•</span>
                        <span>{project.location}</span>
                    </>
                )}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
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
                <Link
                    href={`/projects/${project.id}`}
                    className="ml-auto text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    View Details →
                </Link>
            </div>
        </div>
    );
}
