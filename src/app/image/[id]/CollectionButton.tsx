import React from "react";

import { getUserCollections } from "@/lib/db/queries";
import AddToCollection from "./AddToCollection";

interface CollectionButtonProps {
  imageId: number;
}

export async function CollectionButton({ imageId }: CollectionButtonProps) {
  const collections = await getUserCollections();

  return (
    <AddToCollection collections={collections} imageId={imageId} />
  );
}
