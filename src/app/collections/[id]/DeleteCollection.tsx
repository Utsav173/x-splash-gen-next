"use client";

import { useActionState, useEffect } from "react"; // Assuming this is available
import { useToast } from "@/hooks/use-toast";
import { deleteCollection } from "./actions";
import { ActionState } from "@/lib/auth/middleware";

const DeleteCollectionForm = ({ collectionId }: { collectionId: number }) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteCollection,
    { collectionId }
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
      <button
        type="submit"
        className="text-red-500 hover:underline"
        disabled={pending}
      >
        Delete Collection
      </button>
    </form>
  );
};

export default DeleteCollectionForm;
