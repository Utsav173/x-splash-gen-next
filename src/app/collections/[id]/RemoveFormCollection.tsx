"use client";

import { useActionState, useEffect } from "react"; // Assuming this is available
import { useToast } from "@/hooks/use-toast";
import { removeFromCollection } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash } from "lucide-react";

const RemoveFromCollectionForm = ({
  collectionId,
  imageId,
}: {
  collectionId: number;
  imageId: number;
}) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    removeFromCollection,
    {
      collectionId,
      imageId,
    }
  );

  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({ variant: "destructive", description: state.error });
    } else if (state.message) {
      toast({ description: state.message });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <input
        type="hidden"
        name="collectionId"
        defaultValue={collectionId}
        readOnly
      />
      <input type="hidden" name="imageId" defaultValue={imageId} readOnly />
      <DropdownMenuItem
        className="text-red-600"
        disabled={pending}
        role="button"
        itemType="submit"
      >
        <Trash className="h-4 w-4 mr-2" />
        Remove from Collection
      </DropdownMenuItem>
    </form>
  );
};

export default RemoveFromCollectionForm;
