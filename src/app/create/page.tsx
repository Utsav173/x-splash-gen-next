import { getAllTags } from "@/lib/db/queries";
import ImageUploadForm from "./file-upload-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";

export default async function Page() {
  const tags = await getAllTags();

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <Link href="/">Home</Link>
            </div>
          </div>
        </div>
      </header>
      <ImageUploadForm tags={tags} />
    </main>
  );
}
