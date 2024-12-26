import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getAllImages } from '@/lib/db/queries';
import ImageList from '@/components/image-list';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SearchBar from '@/components/search-bar';

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

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <h1 className="font-bold text-2xl text-gray-900">
                Capture Gallery
              </h1>
              <SearchBar initialQuery={q} />
            </div>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/create">Upload Masterpiece</Link>
            </Button>
          </div>
        </div>
      </header>

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
          <ImageList images={images} q={q} limit={limit} hasMore={hasMore} />
        </Suspense>
      </div>
    </main>
  );
}
