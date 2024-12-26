'use client';

import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useActionState,
  useEffect,
} from 'react';
import { MessageCircle, Share2, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { addComment, deleteComment, updateComment } from './actions';
import { type NestedComment } from '@/lib/db/queries';
import { ActionState } from '@/lib/auth/middleware';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface CommentProps {
  comment: NestedComment;
  imageId: number;
  user?: any;
}

const CommentBox = ({ comment, imageId, user }: CommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const commentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleActionState = useCallback(
    (state: ActionState) => {
      if (state.error) {
        toast({ variant: 'destructive', description: state.error });
      } else if (state.message) {
        toast({ description: state.message });
        setIsEditing(false);
        setEditContent(comment.content);
        setIsReplying(false);
      }
    },
    [toast]
  );

  const [addState, addFormAction] = useActionState<ActionState, FormData>(
    addComment,
    {}
  );

  const [deleteState, deleteFormAction] = useActionState<ActionState, FormData>(
    deleteComment,
    {}
  );

  const [updateState, updateFormAction] = useActionState<ActionState, FormData>(
    updateComment,
    {}
  );

  useEffect(() => {
    if (addState) handleActionState(addState);
    if (deleteState) handleActionState(deleteState);
    if (updateState) handleActionState(updateState);
  }, [addState, deleteState, updateState, handleActionState]);

  const timeAgo = useMemo(() => {
    return formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
    });
  }, [comment.createdAt]);

  const handleShare = () => {
    const commentUrl = `${window.location.href}#comment-${comment.id}`;
    navigator.clipboard.writeText(commentUrl);
    toast({ content: 'Comment link copied to clipboard' });
  };

  return (
    <div
      ref={commentRef}
      id={`comment-${comment.id}`}
      className="relative py-2 pl-4 sm:pl-6"
    >
      <div className="flex gap-2 items-start">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-gray-700 bg-gray-100">
            {comment.user?.email?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 w-full">
              <span className="font-medium text-gray-900">
                {comment.user?.email.split('@')[0]}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>

            <div className="flex items-center gap-1 transition-opacity duration-200 ">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {user && user.id === comment.userId && (
                <>
                  <form action={deleteFormAction}>
                    <input
                      type="text"
                      name="commentId"
                      defaultValue={comment.id}
                      hidden
                      aria-hidden
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-600"
                      disabled={deleteState.pending}
                      type="submit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <form action={updateFormAction} className="space-y-1 mt-1">
              <Textarea
                name="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none rounded-md border-gray-100 focus:border-gray-300 focus:ring-0 text-sm"
                disabled={updateState.pending}
              />
              <input
                type="text"
                name="commentId"
                defaultValue={comment.id}
                hidden
                aria-hidden
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  disabled={updateState.pending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateState.pending}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs"
                >
                  Save
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-700 leading-snug text-sm">
              {comment.content}
            </p>
          )}

          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-gray-500 py-1 pl-0 -ms-1"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">Reply</span>
            </Button>
          )}

          {isReplying && (
            <form action={addFormAction} className="mt-2 space-y-1">
              <Textarea
                name="content"
                placeholder="Write your reply..."
                className="min-h-[60px] resize-none rounded-md border-gray-100 focus:border-gray-300 focus:ring-0 text-sm"
                disabled={addState.pending}
              />

              <input
                type="text"
                name="imageId"
                defaultValue={imageId}
                hidden
                aria-hidden
              />
              <input
                type="text"
                name="replyToId"
                defaultValue={comment.id}
                hidden
                aria-hidden
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplying(false)}
                  disabled={addState.pending}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={addState.pending}
                  className="bg-gray-800 hover:bg-gray-900 text-white text-xs"
                >
                  Post Reply
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l border-dashed border-gray-200 pl-4">
          {comment.replies.map((reply) => (
            <CommentBox key={reply.id} comment={reply} imageId={imageId} />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentSectionProps {
  comments: NestedComment[];
  imageId: number;
}

const CommentSection = ({ comments, imageId }: CommentSectionProps) => {
  const [isCommenting, setIsCommenting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();
  const [addState, addFormAction] = useActionState<ActionState, FormData>(
    addComment,
    {
      onStateChange: (state: ActionState) => {
        if (state.error) {
          toast({ variant: 'destructive', description: state.error });
        } else if (state.message) {
          toast({ description: state.message });
          setIsCommenting(false);
        }
      },
    }
  );

  return (
    <div>
      <div className="pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Comments ({comments?.length || 0})
        </h2>
      </div>

      <div>
        {!isCommenting ? (
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 text-gray-500 border-gray-200',
              {
                'cursor-not-allowed': !user,
              }
            )}
            onClick={() => setIsCommenting(true)}
            disabled={!user}
          >
            <MessageCircle className="h-3 w-3" />
            Write a comment... {user ? '' : '(Sign in to comment)'}
          </Button>
        ) : (
          <form action={addFormAction} className="space-y-2">
            <Textarea
              name="content"
              placeholder="Share your thoughts..."
              className="min-h-[80px] resize-none rounded-md border-gray-100 focus:border-gray-300 focus:ring-0 text-sm"
              disabled={addState.pending}
            />
            <input
              type="text"
              name="imageId"
              defaultValue={imageId}
              hidden
              aria-hidden
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCommenting(false)}
                disabled={addState.pending}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addState.pending}
                className="bg-gray-800 hover:bg-gray-900 text-white text-xs"
              >
                Post Comment
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-4 divide-y divide-gray-200">
        {comments?.map((comment) => (
          <CommentBox
            key={comment.id}
            comment={comment}
            imageId={imageId}
            user={user}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
