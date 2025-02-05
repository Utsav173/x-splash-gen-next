import { Routes } from "discord-api-types/v10";
import { and, asc, desc, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
import { db } from "./drizzle";
import {
  collectionImages,
  collections,
  comments,
  Image,
  images,
  imageTags,
  likes,
  tags,
  users,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "../auth/session";
import { REST } from "@discordjs/rest";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, sessionData.user.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export type ImageWithRelations = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: number;
    name: string | null;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  likes: {
    userId: number;
  }[];
  tags: string[];
};

export async function getAllImages(
  page: number = 1,
  limit: number = 10,
  q?: string
): Promise<
  | {
      images: ImageWithRelations[];
      page: number;
      totalPages: number;
      totalRecords: number;
      perPage: number;
    }
  | any
> {
  try {
    // Calculate offset
    const offset = (page - 1) * limit;

    // Base query to get images with related data
    const baseQuery = db
      .select({
        id: images.id,
        title: images.title,
        description: images.description,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        createdAt: images.createdAt,
        updatedAt: images.updatedAt,
        uploadedBy: users,
        likes: sql<{ userId: number }[]>`
            COALESCE(json_agg(
            json_build_object( 'userId', ${likes.userId} )
           ) FILTER (WHERE ${likes.userId} IS NOT NULL ),'[]')
          `.as("likes"),
        tags: sql<string[]>`
          array_agg(distinct ${tags.name})
          filter (where ${tags.name} is not null)
        `.as("tags"),
      })
      .from(images)
      .leftJoin(users, eq(images.uploadedById, users.id))
      .leftJoin(likes, eq(images.id, likes.imageId))
      .leftJoin(imageTags, eq(images.id, imageTags.imageId))
      .leftJoin(tags, eq(imageTags.tagId, tags.id))
      .groupBy(
        images.id,
        users.id,
        images.title,
        images.description,
        images.imageUrl,
        images.thumbnailUrl,
        images.createdAt,
        images.updatedAt
      );

    // Add search conditions if query parameter exists
    let whereConditions = undefined;
    if (q) {
      whereConditions = or(
        ilike(images.title, `%${q}%`),
        ilike(images.description, `%${q}%`),
        and(isNotNull(users.email), ilike(users.email, `%${q}%`)),
        and(isNotNull(tags.name), ilike(tags.name, `%${q}%`))
      );
      baseQuery.where(whereConditions);
    }

    // Execute the main query with pagination
    const imagesQuery = baseQuery
      .orderBy(desc(images.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total records
    const totalRecordsQuery = db
      .select({
        count: sql<number>`cast(count(distinct ${images.id}) as int)`,
      })
      .from(images)
      .leftJoin(users, eq(images.uploadedById, users.id))
      .leftJoin(imageTags, eq(images.id, imageTags.imageId))
      .leftJoin(tags, eq(imageTags.tagId, tags.id));

    if (whereConditions) {
      totalRecordsQuery.where(whereConditions);
    }

    // Execute both queries concurrently
    const [imagesResult, countResult] = await Promise.all([
      imagesQuery,
      totalRecordsQuery,
    ]);

    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      images: imagesResult,
      page,
      totalPages,
      totalRecords,
      perPage: limit,
      error: "",
    };
  } catch (error) {
    console.error("Error in getAllImages:", error);
    return {
      images: [],
      page: 1,
      totalPages: 1,
      totalRecords: 0,
      perPage: 10,
      error: "Internal server error",
      status: 500,
    };
  }
}
export type ImageDetail = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  publicId: string | null;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy: {
    id: number;
    name: string | null;
    email: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  likes: number;
  likedBy: {
    id: number;
    name: string | null;
    email: string;
  }[];
  tags: {
    id: number;
    name: string;
  }[];
};

export async function getSingleImage(id: number): Promise<ImageDetail | any> {
  try {
    if (!id) {
      return { error: "Image ID is required", status: 400 };
    }

    const imageData = await db
      .select({
        id: images.id,
        title: images.title,
        description: images.description,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        publicId: images.publicId,
        createdAt: images.createdAt,
        updatedAt: images.updatedAt,
        uploadedBy: users,
        likes: sql<number>`count(distinct ${likes.id})`.as("likes_count"),
        likedBy: sql<(typeof users.$inferSelect)[]>`
          array_agg(distinct jsonb_build_object(
            'id', ${likes.userId},
            'name', ${users.name},
            'email', ${users.email}
          ))
          filter (where ${likes.userId} is not null)
        `.as("liked_by"),
        tags: sql<(typeof tags.$inferSelect)[]>`
          array_agg(distinct jsonb_build_object(
            'id', ${tags.id},
            'name', ${tags.name}
          ))
          filter (where ${tags.id} is not null)
        `.as("tags"),
      })
      .from(images)
      .leftJoin(users, eq(images.uploadedById, users.id))
      .leftJoin(likes, eq(images.id, likes.imageId))
      .leftJoin(imageTags, eq(images.id, imageTags.imageId))
      .leftJoin(tags, eq(imageTags.tagId, tags.id))
      .where(eq(images.id, id))
      .groupBy(images.id, users.id);

    if (!imageData || imageData.length === 0) {
      return { error: "Image not found", status: 404 };
    }

    // If you need to fetch image URL from external service
    let finalImageUrl = imageData[0].imageUrl;
    if (imageData[0].publicId) {
      try {
        finalImageUrl = await getImageById(imageData[0].publicId);
      } catch (error) {
        console.error("Error fetching image URL:", error);
      }
    }

    return {
      ...imageData[0],
      imageUrl: finalImageUrl,
    };
  } catch (error) {
    console.error("Error in getSingleImage:", error);
    return { error: "Internal server error", status: 500 };
  }
}

const BOT_TOKEN = process.env.BOT_TOKEN!;
const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

interface Message {
  attachments: { url: string }[];
}

const getImageById = async (messageId: string) => {
  try {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId) {
      throw new Error("Channel ID not provided");
    }

    // Fetch the message from the channel using the message ID
    const message = (await rest.get(
      Routes.channelMessage(channelId, messageId)
    )) as Message;

    // Check if there is an attachment in the message
    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      return attachment.url;
    }

    throw new Error("No attachments found");
  } catch (error) {
    console.error(error);
    throw new Error("Error fetching image by ID");
  }
};

export async function getAllTags(): Promise<
  (typeof tags.$inferSelect)[] | any
> {
  try {
    const tagsData = await db.select().from(tags).orderBy(tags.name);
    return tagsData;
  } catch (error) {
    console.error("Error in getAllTags:", error);
    return { error: "Internal server error", status: 500 };
  }
}

export type NestedComment = typeof comments.$inferSelect & {
  user: typeof users.$inferSelect;
  replies: NestedComment[];
};

export async function getAllCommentsForImage(
  imageId: number
): Promise<{ comments: NestedComment[] }> {
  try {
    // Get all comments for the image
    const allComments = await db.query.comments.findMany({
      where: eq(comments.imageId, imageId),
      with: {
        user: true,
      },
      orderBy: asc(comments.createdAt),
    });

    // Create a map of comments by id
    const commentMap = new Map();
    const rootComments: NestedComment[] = [];

    // First pass: Create all comment objects
    allComments.forEach((comment) => {
      commentMap.set(comment.id, {
        ...comment,
        replies: [],
      });
    });

    // Second pass: Build the tree structure
    allComments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id);
      if (comment.replyToId) {
        const parent = commentMap.get(comment.replyToId);
        if (parent) {
          parent.replies.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return { comments: rootComments };
  } catch (error) {
    console.error("Error fetching comments for image:", error);
    return { comments: [] };
  }
}

export async function getUserCollections() {
  const user = await getUser();
  if (!user?.id) {
    return [];
  }

  const userCollections = await db
    .select({
      id: collections.id,
      title: collections.title,
      userId: collections.userId,
      itemCount: sql<number>`
        (SELECT COUNT(*) FROM collection_images 
         WHERE collection_images.collection_id = collections.id)
      `,
    })
    .from(collections)
    .where(eq(collections.userId, user.id));

  return userCollections;
}

export type CollectionProps = typeof collections.$inferSelect & {
  images: Array<{
    id: number;
    title: string;
    imageUrl: string;
    thumbnailUrl: string;
  }>;
};

export async function getCollectionWithImages(collectionId: number) {
  const user = await getUser();
  if (!user?.id) {
    return null;
  }

  try {
    const result = await db.transaction(async (tx) => {
      const [collection] = await tx
        .select()
        .from(collections)
        .where(eq(collections.id, collectionId))
        .limit(1);

      if (!collection || collection.userId !== user.id) return null;

      const imagesData = await tx
        .select({
          id: images.id,
          title: images.title,
          imageUrl: images.imageUrl,
          thumbnailUrl: images.thumbnailUrl,
        })
        .from(collectionImages)
        .innerJoin(images, eq(collectionImages.imageId, images.id))
        .where(eq(collectionImages.collectionId, collectionId));

      return {
        ...collection,
        images: imagesData,
      };
    });

    return result;
  } catch (error) {
    console.error("Error in getCollectionWithImages:", error);
    return null;
  }
}
