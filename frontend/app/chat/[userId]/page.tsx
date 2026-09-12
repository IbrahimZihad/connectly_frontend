"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { getSocket } from "../../../lib/socket";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
}

export default function ChatConversationPage() {
  const { userId } = useParams<{ userId: string }>();
  const otherId = Number(userId);
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/messages/${otherId}`).then((res) => setMessages(res.data));

    const socket = getSocket();
    function handleMessage(m: Message) {
      const belongsHere =
        (m.senderId === otherId && m.receiverId === user!.id) ||
        (m.senderId === user!.id && m.receiverId === otherId);
      if (belongsHere) setMessages((prev) => [...prev, m]);
    }
    function handleTyping({ fromUserId }: { fromUserId: number }) {
      if (fromUserId !== otherId) return;
      setOtherTyping(true);
      setTimeout(() => setOtherTyping(false), 2000);
    }

    socket?.on("chat:message", handleMessage);
    socket?.on("chat:typing", handleTyping);
    return () => {
      socket?.off("chat:message", handleMessage);
      socket?.off("chat:typing", handleTyping);
    };
  }, [user, otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleTypingInput(value: string) {
    setText(value);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    getSocket()?.emit("chat:typing", { receiverId: otherId });
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    getSocket()?.emit("chat:send", { receiverId: otherId, content: text });
    setText("");
  }

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto space-y-2 pb-3">
        {messages.map((m) => {
          const mine = m.senderId === user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                  mine ? "bg-brand-600 text-white rounded-br-sm" : "bg-white border border-gray-200 rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {otherTyping && <p className="text-xs text-gray-400 pl-1">typing...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 pt-3">
        <input
          value={text}
          onChange={(e) => handleTypingInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-brand-700">
          Send
        </button>
      </form>
    </div>
  );
}
