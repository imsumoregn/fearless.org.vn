import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProjectForm } from "../../components/ProjectForm";

export default async function SubmitProjectPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Submit a Project</h1>
      <ProjectForm type="project" />
    </div>
  );
}

