"use client";

import { useState } from "react";
import { toggleProjectLike } from "@/app/actions/projects";

type LikeButtonProps = {
    projectId: number;
    initialLiked: boolean;
    initialCount: number;
};

export function LikeButton({
    projectId,
    initialLiked,
    initialCount,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (loading) return;
        setLoading(true);

        const wasLiked = liked;
        setLiked(!liked);
        setCount((prev) => (wasLiked ? prev - 1 : prev + 1));

        try {
            await toggleProjectLike(projectId.toString());
        } catch (error) {
            // Revert on error
            setLiked(wasLiked);
            setCount((prev) => (wasLiked ? prev + 1 : prev - 1));
            console.error("Failed to update like:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                liked
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
            <span>{liked ? "❤️" : "🤍"}</span>
            <span>{count}</span>
        </button>
    );
}
