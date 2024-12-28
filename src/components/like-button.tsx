'use client';

import { handleLikePost } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";

const LikeButton = ({ likedBy = [], imageId }: { likedBy?: { id: number }[], imageId: number }) => {
  const { toast } = useToast();
  const handleLike = async (imageId: number) => {
    try {
      const response = await handleLikePost(imageId);

      const result = response as { message: "liked" | "disliked" };

      if (result.message === "liked") {
        toast({ description: "Added to your favorites ❤️" });
      } else if (result.message === "disliked") {
        toast({ description: "Removed from favorites" });
      } else if (result.message === "Unauthorized") {
        toast({ description: "Sign in to like images" });
      } else {
        throw new Error("Unexpected response");
      }
    } catch {
      toast({ description: "Something went wrong. Please try again." });
    }
  };

  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleLike(imageId)}>
      <Heart
        size={22}
        className={likedBy?.length > 0 ? "fill-red-500 text-red-500" : ""}
      />
    </Button>
  );
};

export default LikeButton;
