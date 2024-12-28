import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllImages } from "@/lib/db/queries";
import ImageList from "@/components/image-list";
import SearchBar from "@/components/search-bar";
import { PageHeader } from "@/components/ui/page-header";
import FixButton from "@/components/fix-button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const page = Number((await searchParams).page ?? 1);
  const limit = Number((await searchParams).limit ?? 10);
  const q = (await searchParams).q as string | undefined;

  const { images, error } = await getAllImages(page, limit, q);

  if (error || !images) {
    return (
      <div className="flex justify-center w-full mt-6 text-red-500">
        Error fetching images. Please refresh or come back later.
      </div>
    );
  }

  const hasMore = images.length >= limit;

  const NoImagesFound = () => (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="text-6xl mb-4">🎨</div>
      <h3 className="text-xl font-semibold mb-2">No Masterpieces Found</h3>
      <p className="text-gray-400 mb-6">
        {q ? `No images found for "${q}"` : "Time to create something amazing!"}
      </p>
      <Button asChild className="bg-black hover:bg-gray-800 text-white">
        <Link href="/create">Create Your First Masterpiece</Link>
      </Button>
    </div>
  );

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50">
      <PageHeader
        leftContent={<SearchBar initialQuery={q} />}
        rightContent={<FixButton />}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] rounded-xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          }
        >
          {images.length > 0 ? (
            <ImageList images={images} q={q} limit={limit} hasMore={hasMore} />
          ) : (
            <NoImagesFound />
          )}
        </Suspense>
      </div>
    </main>
  );
}
