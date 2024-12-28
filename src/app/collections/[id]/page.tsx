import React from "react";
import { getCollectionWithImages } from "@/lib/db/queries";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ExternalLink, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import DeleteCollectionForm from "./DeleteCollection";
import RemoveFromCollectionForm from "./RemoveFormCollection";

const ImageCard = ({
  image,
  collectionId,
}: {
  image: {
    id: number;
    title: string;
    imageUrl: string;
  };
  collectionId: number;
}) => {
  return (
    <Card className="group relative overflow-hidden rounded-lg bg-gray-100">
      <Dialog>
        <DialogTrigger asChild>
          <div className="aspect-square cursor-pointer overflow-hidden">
            <img
              src={image.imageUrl}
              alt={image.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white text-sm font-medium truncate">
                  {image.title}
                </p>
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl">
          <div className="relative aspect-square">
            <img
              src={image.imageUrl}
              alt={image.title}
              className="h-full w-full object-cover rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link href={`/image/${image.id}`}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Link>
            </DropdownMenuItem>
            <RemoveFromCollectionForm
              collectionId={collectionId}
              imageId={image.id}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await getCollectionWithImages(Number(id));

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-orange-50 to-orange-100 text-center">
        <div className="max-w-md mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-24 w-24 text-gray-400 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 14l2-2m0 0l2-2m-2 2l2 2m-2-2v6m-7-6a9 9 0 1018 0 9 9 0 00-18 0z"
            />
          </svg>
          <h1 className="text-4xl font-extrabold text-orange-700 mb-4">
            Collection Not Found
          </h1>
          <p className="text-gray-500 text-lg mb-6">
            The collection you’re looking for doesn’t exist or has been removed.
            Don’t worry, you can explore other collections instead.
          </p>
          <Link
            href="/collections"
            className="inline-block px-6 py-3 text-white bg-orange-600 hover:bg-orange-700 rounded-lg shadow-lg font-medium text-lg transition duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Link href="/collections" className="mr-4 flex items-center">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
            <Badge variant="outline" className="text-xs">
              {collection.images.length} images
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {collection.title}
            </h1>
            <DeleteCollectionForm collectionId={collection.id} />
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Created on {new Date(collection.createdAt).toLocaleDateString()}
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collection.images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              collectionId={collection.id}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
