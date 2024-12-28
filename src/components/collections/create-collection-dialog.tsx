import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus } from "lucide-react";
import CreateCollection from "@/app/image/[id]/CreateCollection";

interface CreateCollectionDialogProps {
  variant?: "default" | "empty";
}

export function CreateCollectionDialog({ variant = "default" }: CreateCollectionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={variant === "default" ? "outline" : "default"}
          size={variant === "default" ? "sm" : "default"}
          className={variant === "empty" ? "bg-black hover:bg-gray-800 text-white" : ""}
        >
          <Plus className="w-4 h-4 mr-2" />
          {variant === "default" ? "Add Collection" : "Create Your First Collection"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
        </DialogHeader>
        <CreateCollection noHeader />
      </DialogContent>
    </Dialog>
  );
}
