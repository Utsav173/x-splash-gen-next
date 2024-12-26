"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { collectionImages, collections } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const RemoveformCollectionSchema = z.object({
  collectionId: z.string(),
  imageId: z.string(),
});

const DeleteCollectionSchema = z.object({
  collectionId: z.string(),
});

export const removeFromCollection = validatedAction(
  RemoveformCollectionSchema,
  async (data) => {
    const { collectionId, imageId } = data;
    const parsedCollectionId = parseInt(collectionId);
    const parsedImageId = parseInt(imageId);

    const user = await getUser();
    if (!user?.id) throw new Error("Not authenticated");

    try {
      await db
        .delete(collectionImages)
        .where(
          and(
            eq(collectionImages.imageId, parsedImageId),
            eq(collectionImages.collectionId, parsedCollectionId)
          )
        );

      revalidatePath(`/collections/${parsedCollectionId}`);
      revalidatePath(`/images/${parsedImageId}`);
      return { message: "Image removed from collection" };
    } catch (error) {
      return { error: "Failed to remove image from collection" };
    }
  }
);

export const deleteCollection = validatedAction(
  DeleteCollectionSchema,
  async (data) => {
    const { collectionId } = data;
    const parsedCollectionId = parseInt(collectionId);

    const user = await getUser();
    if (!user?.id) throw new Error("Not authenticated");

    try {
      const [collection] = await db
        .select()
        .from(collections)
        .where(
          and(
            eq(collections.id, parsedCollectionId),
            eq(collections.userId, user.id)
          )
        )
        .limit(1);

      if (!collection) {
        return { error: "Collection not found or unauthorized" };
      }

      await db
        .delete(collections)
        .where(eq(collections.id, parsedCollectionId));

      revalidatePath("/collections");
      redirect("/collections");
    } catch (error) {
      return { error: "Failed to delete collection" };
    }
  }
);
