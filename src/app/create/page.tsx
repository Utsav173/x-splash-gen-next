import { getAllTags } from "@/lib/db/queries";
import ImageUploadForm from "./file-upload-form";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export default async function Page() {
  const tags = await getAllTags();

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50">
      <PageHeader
        leftContent={<Link href="/">Home</Link>}
        rightContent={null}
      />
      <ImageUploadForm tags={tags} />
    </main>
  );
}
