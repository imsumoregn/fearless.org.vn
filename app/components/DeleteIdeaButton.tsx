"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteIdea } from "@/app/actions/ideas";

type DeleteIdeaButtonProps = {
    ideaId: number;
};

export function DeleteIdeaButton({ ideaId }: DeleteIdeaButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async () => {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setLoading(true);
        try {
            await deleteIdea(ideaId.toString());
        } catch (error) {
            console.error("Failed to delete idea:", error);
            alert("Failed to delete idea. Please try again.");
            setLoading(false);
            setConfirmDelete(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm ${
                confirmDelete
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "border border-red-300 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            } disabled:opacity-50`}
        >
            {loading
                ? "Deleting..."
                : confirmDelete
                  ? "Confirm Delete"
                  : "Delete"}
        </button>
    );
}
