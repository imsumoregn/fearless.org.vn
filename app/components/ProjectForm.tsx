"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, updateProject } from "@/app/actions/projects";
import { createIdea, updateIdea } from "@/app/actions/ideas";
import type { ProjectFormData } from "@/app/actions/projects";
import type { IdeaFormData } from "@/app/actions/ideas";

type ProjectFormProps = {
    type: "project" | "idea";
    initialData?: {
        id?: number;
        title: string;
        summary: string;
        authors: string;
        location: string;
        pitchDeck: string;
        estimatedResources: string;
    };
};

export function ProjectForm({ type, initialData }: ProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        summary: initialData?.summary || "",
        authors: Array.isArray(initialData?.authors)
            ? initialData.authors.join(", ")
            : initialData?.authors || "",
        location: initialData?.location || "",
        pitchDeck: initialData?.pitchDeck || "",
        estimatedResources: initialData?.estimatedResources || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        // Parse authors
        const authorsArray = formData.authors
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);

        if (authorsArray.length === 0) {
            setErrors({ authors: "At least one author is required" });
            setLoading(false);
            return;
        }

        try {
            const actionData = {
                ...formData,
                authors: JSON.stringify(authorsArray),
            };

            if (type === "project") {
                if (initialData?.id) {
                    await updateProject(initialData.id.toString(), actionData);
                } else {
                    await createProject(actionData);
                }
            } else {
                if (initialData?.id) {
                    await updateIdea(initialData.id.toString(), actionData);
                } else {
                    await createIdea(actionData);
                }
            }
        } catch (error) {
            setErrors({
                submit:
                    error instanceof Error ? error.message : "Failed to submit",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div>
                <label
                    htmlFor="title"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Title *
                </label>
                <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
            </div>

            <div>
                <label
                    htmlFor="summary"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Summary *
                </label>
                <textarea
                    id="summary"
                    required
                    rows={5}
                    value={formData.summary}
                    onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
                {errors.summary && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.summary}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="authors"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Authors (comma-separated) *
                </label>
                <input
                    type="text"
                    id="authors"
                    required
                    value={formData.authors}
                    onChange={(e) =>
                        setFormData({ ...formData, authors: e.target.value })
                    }
                    placeholder="John Doe, Jane Smith"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
                {errors.authors && (
                    <p className="mt-1 text-sm text-red-600">
                        {errors.authors}
                    </p>
                )}
            </div>

            <div>
                <label
                    htmlFor="location"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Location
                </label>
                <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
            </div>

            <div>
                <label
                    htmlFor="pitchDeck"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Pitch Deck URL
                </label>
                <input
                    type="url"
                    id="pitchDeck"
                    value={formData.pitchDeck}
                    onChange={(e) =>
                        setFormData({ ...formData, pitchDeck: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
            </div>

            <div>
                <label
                    htmlFor="estimatedResources"
                    className="block text-sm font-medium mb-2 font-serif"
                >
                    Estimated Resources
                </label>
                <textarea
                    id="estimatedResources"
                    rows={3}
                    value={formData.estimatedResources}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            estimatedResources: e.target.value,
                        })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                />
            </div>

            {errors.submit && (
                <p className="text-sm text-red-600">{errors.submit}</p>
            )}

            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 disabled:opacity-50 font-serif"
            >
                {loading ? "Submitting..." : initialData ? "Update" : "Submit"}
            </button>
        </form>
    );
}
