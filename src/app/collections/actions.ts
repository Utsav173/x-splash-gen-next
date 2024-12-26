import { db } from '@/lib/db/drizzle';
import { getUser } from '@/lib/db/queries';
import { collectionImages } from '@/lib/db/schema';
import { revalidatePath } from 'next/cache';

export async function addImageToCollection(
  imageId: number,
  collectionId: number
) {
  const user = await getUser();
  if (!user?.id) {
    throw new Error('Not authenticated');
  }

  try {
    await db.insert(collectionImages).values({
      imageId,
      collectionId,
    });

    revalidatePath(`/collections/${collectionId}`);
    revalidatePath(`/images/${imageId}`);

    return { success: true };
  } catch (error) {
    return { error: 'Failed to add image to collection' };
  }
}
