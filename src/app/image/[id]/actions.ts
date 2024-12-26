"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { collectionImages, collections, comments } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const AddCommentSchema = z.object({
  imageId: z.string().transform((val) => parseInt(val)),
  content: z.string().min(1).max(500),
  replyToId: z.string().optional(),
});

const UpdateCommentSchema = z.object({
  commentId: z.string().transform((val) => parseInt(val)),
  content: z.string().min(1).max(500),
});

const DeleteCommentSchema = z.object({
  commentId: z.string().transform((val) => parseInt(val)),
});

export const addComment = validatedAction(
  AddCommentSchema,
  async (data, formData) => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "You must be logged in to comment" };
    }

    const content = data.content;
    const imageId = data.imageId;
    const replyToId = formData.get("replyToId")
      ? parseInt(formData.get("replyToId") as string)
      : null;

    if (!content?.trim()) {
      return { error: "Comment content is required" };
    }

    try {
      await db.insert(comments).values({
        content,
        imageId,
        replyToId,
        userId: user.id,
      });

      revalidatePath("/images/[id]", "page");
      return { message: "Comment added successfully" };
    } catch (error) {
      console.error("Error adding comment:", error);
      return { error: "Failed to add comment" };
    }
  }
);

export const updateComment = validatedAction(
  UpdateCommentSchema,
  async (data) => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "You must be logged in to edit comments" };
    }

    const commentId = data.commentId;
    const content = data.content;

    if (!content?.trim()) {
      return { error: "Comment content is required" };
    }

    try {
      // First, verify the comment belongs to the user
      const existingComment = await db.query.comments.findFirst({
        where: and(eq(comments.id, commentId), eq(comments.userId, user.id)),
      });

      if (!existingComment) {
        return {
          error: "Comment not found or you do not have permission to edit it",
        };
      }

      // Update the comment
      await db
        .update(comments)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(and(eq(comments.id, commentId), eq(comments.userId, user.id)));

      revalidatePath("/images/[id]", "page");
      return { message: "Comment updated successfully" };
    } catch (error) {
      console.error("Error updating comment:", error);
      return { error: "Failed to update comment" };
    }
  }
);

export const deleteComment = validatedAction(
  DeleteCommentSchema,
  async (data) => {
    const user = await getUser();
    if (!user?.id) {
      return { error: "You must be logged in to delete comments" };
    }

    const commentId = data.commentId;

    try {
      // First, verify the comment belongs to the user
      const existingComment = await db.query.comments.findFirst({
        where: and(eq(comments.id, commentId), eq(comments.userId, user.id)),
      });

      if (!existingComment) {
        return {
          error: "Comment not found or you do not have permission to delete it",
        };
      }

      // Start a transaction
      await db.transaction(async (tx) => {
        // Delete the comment and all its descendants using a recursive CTE
        await tx.execute(
          sql`WITH RECURSIVE descendants AS (
                SELECT id FROM comments WHERE id = ${commentId}
                UNION ALL
                SELECT c.id FROM comments c INNER JOIN descendants d ON c.reply_to_id = d.id
              )
              DELETE FROM comments WHERE id IN (SELECT id FROM descendants);`
        );
      });

      revalidatePath("/images/[id]", "page");
      return { message: "Comment and its replies deleted successfully" };
    } catch (error) {
      console.error("Error deleting comment:", error);
      return { error: "Failed to delete comment" };
    }
  }
);

const AddToCollectionSchema = z.object({
  imageId: z.string().transform((val) => parseInt(val)),
  collectionId: z.string().transform((val) => parseInt(val)),
});

export const addImageToCollection = validatedAction(
  AddToCollectionSchema,
  async (data) => {
    const user = await getUser();
    if (!user?.id) throw new Error("Not authenticated");

    // Check if image already exists in collection
    const existing = await db
      .select()
      .from(collectionImages)
      .where(
        and(
          eq(collectionImages.imageId, data.imageId),
          eq(collectionImages.collectionId, data.collectionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { error: "Image already exists in this collection" };
    }

    try {
      await db.insert(collectionImages).values({
        imageId: data.imageId,
        collectionId: data.collectionId,
      });

      revalidatePath(`/collections/${data.collectionId}`);
      revalidatePath(`/images/${data.imageId}`);
      return { message: "Image added to collection" };
    } catch (error) {
      return { error: "Failed to add image to collection" };
    }
  }
);

const CollectionAddSchema = z.object({
  title: z.string().min(1).max(255),
});

export const createCollection = validatedAction(
  CollectionAddSchema,
  async (data, formData) => {
    const user = await getUser();
    if (!user?.id) {
      throw new Error("Not authenticated");
    }

    try {
      await db
        .insert(collections)
        .values({
          title: data.title,
          userId: user.id,
        })
        .returning();

      revalidatePath("/collections");
      revalidatePath("/image/[id]", "page");

      return { message: "Collection created successfully" };
    } catch (error) {
      return { error: "Failed to create collection" };
    }
  }
);
