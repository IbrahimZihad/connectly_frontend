"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, mediaUrl } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import PostCard, { PostData } from "../../../components/PostCard";

interface Profile {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const [profileRes, postsRes] = await Promise.all([
      api.get(`/users/${id}`),
      api.get(`/posts/user/${id}`),
    ]);
    setProfile(profileRes.data);
    setPosts(postsRes.data.map((p: any) => ({ ...p, likeCount: 0, commentCount: 0, likedByMe: false })));
  }

  async function toggleFollow() {
    if (!profile) return;
    if (profile.isFollowing) {
      await api.delete(`/users/${profile.id}/follow`);
    } else {
      await api.post(`/users/${profile.id}/follow`);
    }
    setProfile({
      ...profile,
      isFollowing: !profile.isFollowing,
      followerCount: profile.followerCount + (profile.isFollowing ? -1 : 1),
    });
  }

  if (!profile) return <p className="text-center text-gray-400">Loading...</p>;

  const isMe = user?.id === profile.id;

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-center">
        <img
          src={mediaUrl(profile.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`}
          alt={profile.name}
          className="w-20 h-20 rounded-full object-cover mx-auto"
        />
        <h1 className="text-xl font-bold mt-3">{profile.name}</h1>
        {profile.bio && <p className="text-sm text-gray-500 mt-1">{profile.bio}</p>}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <span>
            <strong>{profile.followerCount}</strong> Followers
          </span>
          <span>
            <strong>{profile.followingCount}</strong> Following
          </span>
        </div>
        {!isMe && (
          <button
            onClick={toggleFollow}
            className={`mt-4 px-5 py-1.5 rounded-full text-sm font-medium ${
              profile.isFollowing ? "bg-gray-100 text-gray-700" : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {profile.isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
