import React from "react";
import { getUserCollections } from "@/lib/db/queries";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import CreateCollection from "../image/[id]/CreateCollection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CollectionsPage() {
  const collections = await getUserCollections();

  return (
    <main className="min-h-screen w-full flex flex-col bg-gray-50 px-2 py-3">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <h1 className="text-2xl font-bold">Your Collections</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                </DialogHeader>
                <CreateCollection noHeader />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-4">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{collection.title}</h2>
            <p className="text-gray-600">
              Created {new Date(collection.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
