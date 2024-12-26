import React from 'react';
import Link from 'next/link';

export function Collection({ collection }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{collection.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.images.map((image: any) => (
          <Link
            key={image.id}
            href={`/images/${image.id}`}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={image.imageUrl!}
              alt={image.title}
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium truncate">{image.title}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
