"use server";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { images, imageTags, tags as Tags } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { validatedAction } from "@/lib/auth/middleware";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const CHANNEL_ID = process.env.CHANNEL_ID!;

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

const uploadToDiscord = async (
  channelId: string,
  chunk: Buffer,
  fileName: string
) => {
  try {
    const message = (await rest.post(Routes.channelMessages(channelId), {
      files: [{ data: chunk, name: fileName }],
      body: {
        content: fileName,
      },
    })) as { attachments: { url: string }[]; id: string };

    return {
      url: message.attachments[0]?.url,
      success: true,
      id: message.id,
    };
  } catch (error) {
    console.error("Error uploading to Discord:", error);
    throw error;
  }
};

const imageUploadSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  tags: z.string().transform((val) => JSON.parse(val)),
  image: z.instanceof(File),
});

export const uploadImages = validatedAction(
  imageUploadSchema,
  async (data, formData) => {
    const currentUser = await getUser();
    const defaultValues = {
      title: data.title,
      description: data.description,
    };

    if (!currentUser) {
      return { success: false, message: "Unauthorized", defaultValues };
    }

    const { title, description, tags, image } = data;

    if (image.size > 7 * 1024 * 1024) {
      return { success: false, message: "File size too large (>7MB)", defaultValues };
    }

    try {
      const uploadResult = await uploadToDiscord(
        CHANNEL_ID!,
        Buffer.from(await image.arrayBuffer()),
        image.name
      );

      if (!uploadResult.success) {
        return {
          success: false,
          message: "Failed to upload image to Discord",
          defaultValues,
        };
      }

      let thumbnailUrl: string | null | undefined = "";

      if (image.type.startsWith("image")) {
        const compressedBuffer = await sharp(
          Buffer.from(await image.arrayBuffer())
        )
          .resize(250)
          .webp({ quality: 50 })
          .toBuffer();

        const thumbnailResult = await uploadToDiscord(
          CHANNEL_ID!,
          compressedBuffer,
          `thumbnail_${image.name}`
        );
        thumbnailUrl = thumbnailResult.url;
      }

      const uploadedBy = currentUser.id;

      // Start a transaction for image and tags
      const result = await db.transaction(async (tx) => {
        // Insert the image first
        const newImage = await tx
          .insert(images)
          .values({
            title,
            description,
            imageUrl: uploadResult.url!,
            thumbnailUrl,
            publicId: uploadResult.id,
            uploadedById: uploadedBy,
          })
          .returning({ id: images.id });

        if (!newImage[0]?.id) {
          throw new Error("Failed to insert image");
        }

        const imageId = newImage[0].id;

        // Process tags if they exist
        if (tags.length > 0) {
          for (const tagName of tags) {
            // Try to find existing tag
            const existingTag = await tx
              .select()
              .from(Tags)
              .where(eq(Tags.name, tagName))
              .limit(1);

            let tagId;

            if (existingTag.length > 0) {
              // Use existing tag
              tagId = existingTag[0].id;
            } else {
              // Create new tag
              const newTag = await tx
                .insert(Tags)
                .values({ name: tagName })
                .returning({ id: Tags.id });

              if (!newTag[0]?.id) {
                throw new Error("Failed to insert tag");
              }

              tagId = newTag[0].id;
            }

            // Create image-tag association
            await tx.insert(imageTags).values({
              imageId,
              tagId,
            });
          }
        }

        return newImage[0].id;
      });

      revalidatePath("/");

      return {
        success: true,
        message: "Image uploaded successfully",
        defaultValues,
      };
    } catch (error) {
      console.error("Error uploading image:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        defaultValues,
      };
    }
  }
);
