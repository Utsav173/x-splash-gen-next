'use client';

import { useActionState, useEffect, useState } from 'react';
import { uploadImages } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X, Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tag } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';

const initialState = {
  message: null,
  error: '',
  defaultValues: {
    title: '',
    description: '',
    image: null,
  },
};

const ImageUploadForm = ({ tags = [] }: { tags?: Tag[] }) => {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    uploadImages,
    initialState
  );

  const router = useRouter();
  const [preview, setPreview] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const inputRef = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state.success) {
      setPreview('');
      setSelectedTags([]);
      router.push('/');
    }
  }, [state.success]);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagAdd = (newTag: string) => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
      setInputValue('');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set('tags', JSON.stringify(selectedTags));
    await formAction(formData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto my-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Image</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={state?.defaultValues?.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              className="min-h-24"
              defaultValue={state?.defaultValues?.description}
            />
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tag(s) selected`
                    : 'Select or add tags...'}

                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)]  p-0 ">
                <Command className="w-full">
                  <CommandInput
                    placeholder="Search or create tag..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && inputValue.trim()) {
                        e.preventDefault();
                        handleTagAdd(inputValue);
                      }
                    }}
                  />
                  <CommandList>
                    <CommandEmpty className="py-2 px-4">
                      {inputValue ? (
                        <>
                          Press <span className="font-bold">Enter</span> to add
                          "{inputValue}" as a new tag
                        </>
                      ) : (
                        'Start typing to create a new tag'
                      )}
                    </CommandEmpty>

                    {tags.length > 0 && (
                      <CommandGroup heading="Existing Tags">
                        {tags.map((tag: Tag) => (
                          <CommandItem
                            key={tag.name}
                            value={tag.name}
                            onSelect={(value) => {
                              setSelectedTags((prev) => {
                                const isSelected = prev.includes(value);
                                return isSelected
                                  ? prev.filter((t) => t !== value)
                                  : [...prev, value];
                              });
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedTags.includes(tag.name)
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            {tag.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2 mt-2">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setSelectedTags((tags) => tags.filter((t) => t !== tag))
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="image">Image</Label>
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="image"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="object-contain w-full h-full rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-12 h-12 mb-4 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          {state.message && (
            <Alert className="bg-green-50">
              <AlertDescription> {state.message}</AlertDescription>
            </Alert>
          )}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Image'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
export default ImageUploadForm;
