'use client';

import React from 'react';
import { Button } from './ui/button';
import { Share2 } from 'lucide-react';

const ClickButton = ({ title }: { title: string }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => {
        navigator.share({
          title,
          text: `Check out this amazing photo on Capture Gallery`,
          url: window.location.href,
        });
      }}
    >
      <Share2 size={18} />
    </Button>
  );
};

export default ClickButton;
