"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface Conversation {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

export default function ChatListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (user) api.get("/messages/conversations").then((res) => setConversations(res.data));
  }, [user]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      api.get(`/users/search?q=${encodeURIComponent(query)}`).then((res) => setResults(res.data));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Messages</h1>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people to message..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {results.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg mb-4 divide-y">
          {results.map((r) => (
            <Link key={r.id} href={`/chat/${r.id}`} className="block p-3 text-sm hover:bg-gray-50">
              {r.name}
            </Link>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {conversations.map((c) => {
          const otherId = c.senderId === user.id ? c.receiverId : c.senderId;
          return (
            <Link
              key={c.id}
              href={`/chat/${otherId}`}
              className="block bg-white border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-50"
            >
              <p className="truncate">{c.content}</p>
              <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
            </Link>
          );
        })}
        {conversations.length === 0 && (
          <p className="text-gray-400 text-sm">No conversations yet — search for someone to start chatting.</p>
        )}
      </div>
    </div>
  );
}
