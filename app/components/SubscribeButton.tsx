"use client";

import { useState } from "react";
import { toggleProjectSubscription } from "@/app/actions/projects";

type SubscribeButtonProps = {
    projectId: number;
    initialSubscribed: boolean;
    initialCount: number;
};

export function SubscribeButton({
    projectId,
    initialSubscribed,
    initialCount,
}: SubscribeButtonProps) {
    const [subscribed, setSubscribed] = useState(initialSubscribed);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (loading) return;
        setLoading(true);

        const wasSubscribed = subscribed;
        setSubscribed(!subscribed);
        setCount((prev) => (wasSubscribed ? prev - 1 : prev + 1));

        try {
            await toggleProjectSubscription(projectId.toString());
        } catch (error) {
            // Revert on error
            setSubscribed(wasSubscribed);
            setCount((prev) => (wasSubscribed ? prev + 1 : prev - 1));
            console.error("Failed to update subscription:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                subscribed
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
        >
            <span>{subscribed ? "✓ Subscribed" : "+ Subscribe"}</span>
            <span className="text-xs">({count})</span>
        </button>
    );
}
