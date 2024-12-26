import React from "react";
import {
  getAllCommentsForImage,
  getSingleImage,
  getUser,
} from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ClickButton from "@/components/share-button";
import DownloadButton from "@/components/download-button";
import LikeButton from "@/components/like-button";
import CommentSection from "./Comment";
import { CollectionButton } from "./CollectionButton";

export default async function ImageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const imageData = await getSingleImage(Number(id));
  const { comments } = await getAllCommentsForImage(Number(id));
  const user = await getUser();

  if (imageData?.error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500 text-xl">
          {imageData.error || "An error occurred"}
        </p>
      </div>
    );
  }

  const { title, description, imageUrl, createdAt, uploadedBy, likedBy, tags } =
    imageData;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Gallery</span>
            </Link>
            <div className="flex items-center gap-2">
              <ClickButton title={title} key={`title-${id}`} />
              {user && <CollectionButton imageId={Number(id)} />}
              <DownloadButton
                imageUrl={imageUrl}
                title={title}
                key={`download-${id}`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img src={imageUrl} alt={title} className="w-full h-auto" />
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Image Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

                <LikeButton likedBy={likedBy} imageId={Number(id)} />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={uploadedBy.image || ""} />
                  <AvatarFallback>{uploadedBy.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">{uploadedBy.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{description}</p>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag: { id: string; name: string }) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="rounded-full"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Comments Section */}
          </div>

          <div className="lg:col-span-full">
            <CommentSection comments={comments} imageId={Number(id)} />
          </div>
        </div>
      </div>
    </main>
  );
}
