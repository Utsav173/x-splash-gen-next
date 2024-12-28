"use client";
import { fixImages } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Button } from "./ui/button";
import { CloudHail } from "lucide-react";

const FixButton = () => {
  const { toast } = useToast();
  const handleFix = async () => {
    try {
      const response = await fixImages();

      const result = response as { message: string };

      if (result.message) {
        toast({ description: result.message });
      }
    } catch {
      toast({ description: "Something went wrong. Please try again." });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={handleFix}
    >
      <CloudHail size={22} />
    </Button>
  );
};

export default FixButton;
