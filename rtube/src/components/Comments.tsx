import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import ReportDialog from "./ReportDialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/lib/languages";
interface Comment {
  _id: string;
  videoid: string;
  userid: {
    _id: string;
    name: string;
    image: string;
  };

  commentbody: string;
  usercommented: string;
  commentedon: string;

  likes: string[];
  dislikes: string[];

  preferredLanguage: string;
  translatedText?: string;
  translatedLanguage?: string;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState("");
  const [translatingId, setTranslatingId] = useState("");

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      console.log(res.data);
      console.log(res.data.filter((c: any) => c.userid === null));
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading history...</div>;
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
      });
      if (res.data.comment) {
        await loadComments();
        setNewComment("");
        toast.success("Comment posted successfully.");
      }
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText },
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId ? { ...c, commentbody: editText } : c,
          ),
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/comment/like/${commentId}`, {
        userId: user._id,
      });
      await loadComments();

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id !== commentId) return comment;

          const alreadyLiked = comment.likes.includes(user._id);

          let updatedLikes = [...comment.likes];
          let updatedDislikes = [...comment.dislikes];

          if (alreadyLiked) {
            updatedLikes = updatedLikes.filter((id) => id !== user._id);
          } else {
            updatedLikes.push(user._id);
            updatedDislikes = updatedDislikes.filter((id) => id !== user._id);
          }

          return {
            ...comment,
            likes: updatedLikes,
            dislikes: updatedDislikes,
          };
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async (commentId: string) => {
    if (!user) return;

    try {
      await axiosInstance.post(`/comment/dislike/${commentId}`, {
        userId: user._id,
      });
      await loadComments();

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id !== commentId) return comment;

          const alreadyDisliked = comment.dislikes.includes(user._id);

          let updatedLikes = [...comment.likes];
          let updatedDislikes = [...comment.dislikes];

          if (alreadyDisliked) {
            updatedDislikes = updatedDislikes.filter((id) => id !== user._id);
          } else {
            updatedDislikes.push(user._id);
            updatedLikes = updatedLikes.filter((id) => id !== user._id);
          }

          return {
            ...comment,
            likes: updatedLikes,
            dislikes: updatedDislikes,
          };
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleReport = async (reason: string) => {
    if (!user || !selectedCommentId) return;

    try {
      const res = await axiosInstance.post(
        `/comment/report/${selectedCommentId}`,
        {
          userId: user._id,
          reason,
        },
      );

      console.log(res.data);

      await loadComments();
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleTranslate = async (commentId: string, targetLanguage: string) => {
    try {
      setTranslatingId(commentId);

      const res = await axiosInstance.post(`/comment/translate/${commentId}`, {
        targetLanguage,
      });

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                translatedText: res.data.translatedText,
                translatedLanguage: targetLanguage,
              }
            : comment,
        ),
      );
    } catch (error) {
      console.log(error);
    } finally {
      setTranslatingId("");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-black dark:text-white">
        {comments.length} Comments
      </h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.userid?.image || ""} />
                <AvatarFallback>
                  {comment.userid?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm  text-black dark:text-white">
                    {comment.userid?.name || "Deleted User"}{" "}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-black dark:text-gray-100">
                      {comment.commentbody}
                    </p>

                    {comment.translatedText && (
                      <div className="mt-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
                        <p className="text-xs text-gray-500 mb-1">Translated</p>

                        <p className="text-sm">{comment.translatedText}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <button
                        onClick={() => handleLike(comment._id)}
                        className="flex items-center gap-1 hover:text-blue-600 transition"
                      >
                        <ThumbsUp
                          size={16}
                          className={
                            comment.likes.includes(user?._id || "")
                              ? "fill-blue-600 text-blue-600"
                              : ""
                          }
                        />
                        {comment.likes.length}
                      </button>

                      <button
                        onClick={() => handleDislike(comment._id)}
                        className="flex items-center gap-1 hover:text-red-600 transition"
                      >
                        <ThumbsDown
                          size={16}
                          className={
                            comment.dislikes.includes(user?._id || "")
                              ? "fill-red-600 text-red-600"
                              : ""
                          }
                        />
                        {comment.dislikes.length}
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Translate
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="start">
                          {languages.map((lang) => (
                            <DropdownMenuItem
                              key={lang.code}
                              onClick={() =>
                                handleTranslate(comment._id, lang.code)
                              }
                            >
                              {lang.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {comment.userid?._id !== user?._id && (
                        <button
                          onClick={() => {
                            setSelectedCommentId(comment._id);
                            setReportDialogOpen(true);
                          }}
                          className="flex items-center gap-1 hover:text-red-600 transition"
                        >
                          <Flag size={16} />
                          Report
                        </button>
                      )}
                      {comment.userid?._id === user?._id && (
                        <>
                          <button onClick={() => handleEdit(comment)}>
                            Edit
                          </button>

                          <button onClick={() => handleDelete(comment._id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        onSubmit={handleReport}
      />
    </div>
  );
};

export default Comments;