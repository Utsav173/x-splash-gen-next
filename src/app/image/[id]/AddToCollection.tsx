"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ActionState } from "@/lib/auth/middleware";
import React, { useActionState, useEffect, useState } from "react";
import { addImageToCollection } from "./actions";
import { getUserCollections } from "@/lib/db/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import CreateCollection from "./CreateCollection";

const AddToCollection = ({
  collections,
  imageId,
}: {
  collections: Awaited<ReturnType<typeof getUserCollections>>;
  imageId: number;
}) => {
  const [mainDialogOpen, setMainDialogOpen] = useState(false);
  const [newCollectionDialogOpen, setNewCollectionDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addImageToCollection,
    {}
  );

  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", description: state.error });
    } else if (state.message) {
      setMainDialogOpen(false);
      toast({ description: state.message });
    }
  }, [state, toast]);

  return (
    <Dialog open={mainDialogOpen} onOpenChange={setMainDialogOpen}>
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
          {collections.length === 0 ? (
            <CreateCollection />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Select collection:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCollectionDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </div>

              {collections.map((collection) => (
                <form key={collection.id} action={formAction}>
                  <input
                    type="hidden"
                    name="collectionId"
                    value={collection.id.toString()}
                  />
                  <input
                    type="hidden"
                    name="imageId"
                    value={imageId.toString()}
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="w-full justify-start text-left"
                    disabled={pending}
                  >
                    {collection.title}
                  </Button>
                </form>
              ))}
            </>
          )}
        </div>
      </DialogContent>

      {/* Nested Dialog for Creating New Collection */}
      <Dialog
        open={newCollectionDialogOpen}
        onOpenChange={setNewCollectionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
          </DialogHeader>
          <CreateCollection noHeader />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AddToCollection;
