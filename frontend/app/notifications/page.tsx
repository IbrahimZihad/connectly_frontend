"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../lib/socket";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "message";
  postId?: number | null;
  read: boolean;
  createdAt: string;
  fromUser: { id: number; name: string };
}

function describe(n: Notification) {
  switch (n.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    case "follow":
      return "started following you";
    default:
      return "sent you a message";
  }
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get("/notifications").then((res) => setNotifications(res.data));
    api.post("/notifications/read");

    const socket = getSocket();
    socket?.on("notification", (n: Notification) => setNotifications((prev) => [n, ...prev]));
    return () => {
      socket?.off("notification");
    };
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Notifications</h1>
      {notifications.length === 0 && <p className="text-gray-400 text-sm">No notifications yet.</p>}
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white border border-gray-200 rounded-lg p-3 text-sm flex justify-between">
            <span>
              <Link href={`/profile/${n.fromUser.id}`} className="font-medium hover:underline">
                {n.fromUser.name}
              </Link>{" "}
              {describe(n)}
            </span>
            <span className="text-gray-400 text-xs">{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
