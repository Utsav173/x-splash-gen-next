'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { saveAs } from 'file-saver';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Heart, Share2, ZoomIn } from 'lucide-react';
import { ImageWithRelations } from '@/lib/db/queries';
import { handleLikePost } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface Props {
  images: ImageWithRelations[];
  q?: string;
  hasMore: boolean;
  limit: number;
}

export default function ImageList({
  images: initialImages,
  q,
  hasMore,
  limit,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [images, setImages] =
    React.useState<ImageWithRelations[]>(initialImages);
  const [loading, setLoading] = React.useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  const loadMoreImages = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const nextPage = Math.ceil(images.length / limit) + 1;
      const searchParams = new URLSearchParams();
      searchParams.set('page', nextPage.toString());
      searchParams.set('limit', limit.toString());
      if (q) searchParams.set('q', q);

      router.push(`${window.location.pathname}?${searchParams.toString()}`, {
        scroll: false,
      });
    } catch (error) {
      toast({ description: 'Failed to load more images' });
    } finally {
      setLoading(false);
    }
  }, [images.length, limit, loading, hasMore, q, toast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreImages();
        }
      },
      { threshold: 0.1 }
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMoreImages]);

  const handleLike = async (imageId: number) => {
    try {
      const response = await handleLikePost(imageId);

      const result = response as {
        message: 'liked' | 'disliked' | 'Unauthorized';
      };

      if (result.message === 'liked') {
        setImages((currentImages) =>
          currentImages.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  likes: [...(img.likes || []), { userId: -1 }],
                }
              : img
          )
        );
        toast({ description: 'Added to your favorites ❤️' });
      } else if (result.message === 'disliked') {
        setImages((currentImages) =>
          currentImages.map((img) => ({
            ...img,
            likes: (img.likes || []).filter((like) => like.userId !== -1),
          }))
        );
        toast({ description: 'Removed from favorites' });
      } else if (result.message === 'Unauthorized') {
        toast({ description: 'Sign in to like images' });
      }
    } catch {
      toast({ description: 'Something went wrong. Please try again.' });
    }
  };

  const handleShare = async (image: ImageWithRelations) => {
    try {
      await navigator.share({
        title: image.title,
        text: `Check out this amazing photo on Capture Gallery`,
        url: `/image/${image.id}`,
      });
    } catch (error) {
      toast({ description: "Your browser doesn't support sharing" });
    }
  };

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 p-4">
      {images.map((image, index) => (
        <div
          key={image.id}
          className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out mb-6 break-inside-avoid transform hover:scale-105"
          ref={index === images.length - 1 ? lastElementRef : null}
        >
          {/* Image Container */}
          <div className="relative group">
            <img
              src={image.thumbnailUrl || image.imageUrl}
              alt={image.title || 'Image preview'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-center p-4">
              <p className="text-white text-lg font-semibold line-clamp-1">
                {image.title}
              </p>
              <p className="text-white text-sm opacity-80 mt-1">
                by {image.uploadedBy?.email.split('@')[0]}
              </p>
              <div className="flex space-x-2 mt-4">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white/90 text-gray-800 rounded-full transition-transform duration-300 hover:scale-110"
                  onClick={() => handleLike(image.id)}
                  aria-label={
                    image.likes?.some((like) => like.userId)
                      ? `Unlike image titled ${image.title}`
                      : `Like image titled ${image.title}`
                  }
                >
                  <Heart
                    size={18}
                    className={
                      image.likes?.some((like) => like.userId)
                        ? 'fill-red-500 text-red-500'
                        : ''
                    }
                  />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white/90 text-gray-800 rounded-full transition-transform duration-300 hover:scale-110"
                  onClick={() => saveAs(image.imageUrl, `${image.title}.jpg`)}
                  aria-label={`Download image titled ${image.title}`}
                >
                  <Download size={18} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white/90 text-gray-800 rounded-full transition-transform duration-300 hover:scale-110"
                  onClick={() => handleShare(image)}
                  aria-label={`Share image titled ${image.title}`}
                >
                  <Share2 size={18} />
                </Button>
                <Link
                  href={`/image/${image.id}`}
                  aria-label={`View details of image titled ${image.title}`}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/80 hover:bg-white/90 text-gray-800 rounded-full transition-transform duration-300 hover:scale-110"
                  >
                    <ZoomIn size={18} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="col-span-full flex justify-center py-4">
          <div className="loading loading-dots loading-md" />
        </div>
      )}
    </div>
  );
}
