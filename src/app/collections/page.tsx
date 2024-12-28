import React from "react";
import { getUserCollections } from "@/lib/db/queries";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderIcon, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NoCollectionsFound = () => (
  <div className="flex flex-col items-center justify-center h-96 space-y-4">
    <FolderIcon className="h-16 w-16 text-gray-300" />
    <h3 className="text-lg font-medium text-gray-700">No Collections Yet</h3>
    <p className="text-sm text-gray-500 max-w-sm text-center">
      Start organizing your favorite masterpieces by creating your first
      collection
    </p>
    <CreateCollectionDialog variant="empty" />
  </div>
);

const CollectionCard = ({ collection }: { collection: any }) => (
  <Link
    href={`/collections/${collection.id}`}
    prefetch={true}
    className="group outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-lg"
  >
    <Card className="h-full border-none bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base font-medium text-gray-700">
              {collection.title}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {collection.itemCount || 0} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500">
          Created {new Date(collection.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  </Link>
);
export default async function CollectionsPage() {
  const collections = await getUserCollections();

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50">
      <PageHeader
        leftContent={<h1 className="text-2xl font-bold">Your Collections</h1>}
        rightContent={<CreateCollectionDialog />}
      />

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4 px-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <NoCollectionsFound />
      )}
    </main>
  );
}
