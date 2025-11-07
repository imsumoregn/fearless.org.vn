import Link from "next/link";

type ProjectIdea = {
  id: number;
  title: string;
  summary: string;
  authors: string;
  location: string | null;
  authorId: string;
  createdAt: Date;
};

type ProjectIdeaCardProps = {
  idea: ProjectIdea;
};

export function ProjectIdeaCard({ idea }: ProjectIdeaCardProps) {
  let authors: string | string[];
  try {
    authors = JSON.parse(idea.authors || "[]");
  } catch {
    authors = idea.authors || "";
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <Link href={`/ideas/${idea.id}`}>
        <h3 className="text-xl font-serif font-semibold mb-2 hover:underline">
          {idea.title}
        </h3>
      </Link>
      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {idea.summary}
      </p>
      <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium">Authors:</span>
        <span>{Array.isArray(authors) ? authors.join(", ") : authors}</span>
        {idea.location && (
          <>
            <span className="mx-2">•</span>
            <span>{idea.location}</span>
          </>
        )}
      </div>
      <Link
        href={`/ideas/${idea.id}`}
        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        View Details →
      </Link>
    </div>
  );
}

