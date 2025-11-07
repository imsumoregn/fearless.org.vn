"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFeedItem } from "@/app/actions/feed";

type FeedItemFormProps = {
    projectId: number;
};

export function FeedItemForm({ projectId }: FeedItemFormProps) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createFeedItem(projectId, content);
            setContent("");
            router.refresh();
        } catch (error) {
            console.error("Failed to add feed item:", error);
            alert("Failed to add feed item. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update about this project..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 mb-2"
            />
            <button
                type="submit"
                disabled={loading || !content.trim()}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 disabled:opacity-50 text-sm"
            >
                {loading ? "Posting..." : "Post Update"}
            </button>
        </form>
    );
}
