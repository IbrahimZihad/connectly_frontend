"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import PostCard, { PostData } from "../../components/PostCard";

export default function FeedPage() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<PostData[]>([]);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (user) loadFeed();
  }, [user]);

  async function loadFeed() {
    const res = await api.get("/posts/feed");
    setPosts(res.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() && !file) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("media", file);
      const res = await api.post("/posts", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setPosts((p) => [{ ...res.data, likeCount: 0, commentCount: 0, likedByMe: false }, ...p]);
      setContent("");
      setFile(null);
    } finally {
      setPosting(false);
    }
  }

  if (loading) return <p className="text-center text-gray-400">Loading...</p>;
  if (!user) return null;

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full resize-none border-none focus:outline-none text-sm"
          rows={3}
        />
        <div className="flex items-center justify-between mt-2">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-gray-500"
          />
          <button
            type="submit"
            disabled={posting}
            className="bg-brand-600 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-brand-700 disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 text-sm">
          No posts yet. Follow people or write your first post!
        </p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
