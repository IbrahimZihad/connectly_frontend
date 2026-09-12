"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { mediaUrl } from "../lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="text-lg font-bold text-brand-600">
          Connectly
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/feed" className="text-gray-600 hover:text-brand-600">
            Feed
          </Link>
          <Link href="/chat" className="text-gray-600 hover:text-brand-600">
            Chat
          </Link>
          <Link href="/notifications" className="text-gray-600 hover:text-brand-600">
            Alerts
          </Link>
          <Link href={`/profile/${user.id}`} className="flex items-center gap-2">
            <img
              src={mediaUrl(user.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-gray-200"
            />
          </Link>
          <button onClick={logout} className="text-gray-400 hover:text-red-500">
            Log out
          </button>
        </nav>
      </div>
    </header>
  );
}
