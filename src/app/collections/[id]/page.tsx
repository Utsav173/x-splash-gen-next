import React from "react";
import { getCollectionWithImages } from "@/lib/db/queries";
import Link from "next/link";
import DeleteCollectionForm from "./DeleteCollection";
import RemoveFromCollectionForm from "./RemoveFormCollection";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionWithImages(Number(id));

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-orange-50 to-orange-100 text-center">
        <div className="max-w-md mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-gray-400 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 14l2-2m0 0l2-2m-2 2l2 2m-2-2v6m-7-6a9 9 0 1018 0 9 9 0 00-18 0z"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-orange-700 mb-4">
            Collection Not Found
          </h1>
          <p className="text-gray-500 text-lg mb-6">
            The collection you’re looking for doesn’t exist or has been removed.
            Don’t worry, you can explore other collections instead.
          </p>
          <Link
            href="/collections"
            className="inline-block px-6 py-3 text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg font-medium text-lg transition duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{collection.title}</h1>
          <DeleteCollectionForm collectionId={collection.id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collection.images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg group"
            >
              <Link href={`/images/${image.id}`}>
                <img
                  src={image.imageUrl!}
                  alt={image.title}
                  loading="lazy"
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-2 flex items-center">
                  <p className="text-white text-sm font-medium mr-2 truncate">
                    {image.title}
                  </p>
                  <RemoveFromCollectionForm
                    collectionId={collection.id}
                    imageId={image.id}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
