import { getAllTags } from '@/lib/db/queries';
import ImageUploadForm from './file-upload-form';

export default async function Page() {
  const tags = await getAllTags();

  return <ImageUploadForm tags={tags} />;
}
