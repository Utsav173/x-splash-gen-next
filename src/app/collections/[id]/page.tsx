import React from 'react';
import { getCollectionWithImages } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { Collection } from '../collections';

export default async function CollectionPage({
  params,
}: {
  params: { id: string };
}) {
  const collection = await getCollectionWithImages(Number(params.id));

  if (!collection) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <Collection collection={collection} />
    </div>
  );
}
