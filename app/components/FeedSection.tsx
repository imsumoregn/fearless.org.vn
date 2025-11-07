import { FeedItemForm } from "./FeedItemForm";

type FeedItem = {
  id: number;
  content: string;
  authorId: string;
  createdAt: Date;
};

type FeedSectionProps = {
  projectId: number;
  feedItems: FeedItem[];
  currentUserId?: string;
  isSubscribed: boolean;
};

export function FeedSection({
  projectId,
  feedItems,
  currentUserId,
  isSubscribed,
}: FeedSectionProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-serif font-semibold mb-4">Project Feed</h2>
      {isSubscribed && currentUserId && (
        <FeedItemForm projectId={projectId} />
      )}
      <div className="space-y-4 mt-6">
        {feedItems.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No feed items yet. Subscribe to this project to add updates!
          </p>
        ) : (
          feedItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
            >
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.content}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

