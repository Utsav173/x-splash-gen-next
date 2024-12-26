"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActionState } from "@/lib/auth/middleware";
import React, { useActionState, useEffect } from "react";
import { createCollection } from "./actions";
import { useToast } from "@/hooks/use-toast";

const CreateCollection = ({ noHeader }: { noHeader?: boolean }) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCollection,
    {}
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
    <form action={formAction} className="space-y-4">
      <div>
        {!noHeader && (
          <p className="text-sm text-gray-500 mb-4">
            Create your first collection:
          </p>
        )}
        <Input
          name="title"
          placeholder="Collection name"
          required
          minLength={3}
          disabled={pending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        Create and Add Image
      </Button>
    </form>
  );
};

export default CreateCollection;
