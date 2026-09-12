"use client";

import { useState } from "react";
import Link from "next/link";
import { api, mediaUrl } from "../lib/api";

export interface PostAuthor {
  id: number;
  name: string;
  avatarUrl?: string | null;
}

export interface PostData {
  id: number;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

interface Comment {
  id: number;
  content: string;
  author: PostAuthor;
}

export default function PostCard({ post }: { post: PostData }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  async function toggleLike() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) await api.delete(`/posts/${post.id}/like`);
      else await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
    }
  }

  async function loadComments() {
    setShowComments((s) => !s);
    if (comments.length || loadingComments) return;
    setLoadingComments(true);
    const res = await api.get(`/posts/${post.id}/comments`);
    setComments(res.data);
    setLoadingComments(false);
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await api.post(`/posts/${post.id}/comments`, { content: commentText });
    setComments((c) => [...c, res.data]);
    setCommentText("");
  }

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-3">
        <img
          src={mediaUrl(post.author.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}`}
          alt={post.author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <Link href={`/profile/${post.author.id}`} className="font-semibold hover:underline">
            {post.author.name}
          </Link>
          <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {post.content && <p className="mt-3 whitespace-pre-wrap">{post.content}</p>}
      {post.mediaUrl && (
        <img src={mediaUrl(post.mediaUrl)!} alt="post media" className="mt-3 rounded-lg w-full object-cover max-h-96" />
      )}

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <button onClick={toggleLike} className={liked ? "text-brand-600 font-medium" : "hover:text-brand-600"}>
          {liked ? "Liked" : "Like"} ({likeCount})
        </button>
        <button onClick={loadComments} className="hover:text-brand-600">
          Comments ({post.commentCount})
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
          {loadingComments && <p className="text-xs text-gray-400">Loading comments...</p>}
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium">{c.author.name}: </span>
              <span>{c.content}</span>
            </div>
          ))}
          <form onSubmit={submitComment} className="flex gap-2 mt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" className="text-sm text-brand-600 font-medium">
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
