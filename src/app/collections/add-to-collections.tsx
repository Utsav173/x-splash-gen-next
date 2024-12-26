import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getUserCollections } from '@/lib/db/queries';
import { addImageToCollection } from './actions';

interface AddToCollectionProps {
  imageId: number;
}

export async function AddToCollection({ imageId }: AddToCollectionProps) {
  const collections = await getUserCollections();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {collections.map((collection) => (
            <form
              key={collection.id}
              action={async () => {
                'use server';
                await addImageToCollection(imageId, collection.id);
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-left"
              >
                {collection.title}
              </Button>
            </form>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
