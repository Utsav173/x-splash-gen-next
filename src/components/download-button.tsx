'use client';

import React from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { saveAs } from 'file-saver';

const DownloadButton = ({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={() => saveAs(imageUrl, `${title}.jpg`)}
    >
      <Download size={18} />
    </Button>
  );
};

export default DownloadButton;
