"use server";

import { Routes } from "discord-api-types/v10";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { images, likes, users, type NewUser } from "@/lib/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUser } from "@/lib/db/queries";
import {
  validatedAction,
  validatedActionWithUser,
} from "@/lib/auth/middleware";
import { revalidatePath } from "next/cache";
import { REST } from "@discordjs/rest";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  const { user: foundUser } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  await setSession(foundUser);

  redirect("/");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  inviteId: z.string().optional(),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, inviteId } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  await setSession(createdUser);

  redirect("/");
});

export async function signOut() {
  (await cookies()).delete("session");
}

const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return { error: "Current password is incorrect." };
    }

    if (currentPassword === newPassword) {
      return {
        error: "New password must be different from the current password.",
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return { success: "Password updated successfully." };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: "Incorrect password. Account deletion failed." };
    }

    // Soft delete
    await db.delete(users).where(eq(users.id, user.id));

    (await cookies()).delete("session");
    redirect("/sign-in");
  }
);

export async function handleLikePost(imageId: number) {
  const user = await getUser();
  if (!user) {
    return { message: "Unauthorized" };
  }
  const userId = user?.id;

  try {
    const existingLike = await db.query.likes.findFirst({
      where: and(eq(likes.imageId, imageId), eq(likes.userId, userId)),
    });

    if (existingLike) {
      await db
        .delete(likes)
        .where(and(eq(likes.imageId, imageId), eq(likes.userId, userId)));

      revalidatePath("/");
      revalidatePath(`/image/${imageId}`);

      return { message: "disliked" };
    } else {
      await db.insert(likes).values({
        imageId,
        userId,
      });

      revalidatePath("/");
      revalidatePath(`/image/${imageId}`);

      return { message: "liked" };
    }
  } catch (error) {
    console.error("Error in like post action", error);
    return { message: (error as Error).message };
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

export const fixImages = async () => {
  try {
    const imagesData = await db
      .select({
        id: images.id,
        title: images.title,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
        public_id: images.publicId,
      })
      .from(images);

    for (const image of imagesData) {
      if (image.public_id) {
        // Fetch the latest URL using the public_id
        const latestUrl = await getImageById(image.public_id);

        if (latestUrl) {
          // Update image URL only if it's different
          if (latestUrl !== image.imageUrl) {
            image.imageUrl = latestUrl;
          }

          // Check and update the thumbnail URL if necessary
          if (image.thumbnailUrl) {
            const latestThumbnailUrl = await getImageById(image.public_id);
            // Adjust the logic if needed for thumbnail retrieval
            if (
              latestThumbnailUrl &&
              latestThumbnailUrl !== image.thumbnailUrl
            ) {
              image.thumbnailUrl = latestThumbnailUrl;
            }
          }

          // Update the image in the database
          await db
            .update(images)
            .set({
              imageUrl: image.imageUrl,
              thumbnailUrl: image.thumbnailUrl,
            })
            .where(eq(images.id, image.id));
        } else {
          console.log(`Could not retrieve new URL for image: ${image.title}`);
        }
      }
    }

    revalidatePath("/");
    return { message: "Images fixed successfully." };
  } catch (error) {
    console.log(error);
    return { message: "Error fixing images." };
  }
};
