"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Adjust for your backend

interface Message {
  _id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read"; // New message status
}

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("user123");
  const otherUser = currentUser === "user123" ? "user456" : "user123";
  const [typing, setTyping] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        if (!res.ok) throw new Error("Failed to fetch messages");

        const result = await res.json();
        setMessages(result);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Listen for new messages from WebSocket
    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== currentUser) {
        setUnreadMessages((prev) => prev + 1);
      }
    });

    // Listen for typing indicator
    socket.on("typing", (user) => {
      if (user !== currentUser) {
        setTyping(true);
        setTimeout(() => setTyping(false), 1500);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("typing");
    };
  }, [currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: currentUser,
      receiverId: otherUser,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");

      // Emit new message to WebSocket server
      socket.emit("sendMessage", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", currentUser);
  };

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Chat App</h1>

      {/* User Selection */}
      <div className="mb-4 flex items-center space-x-3">
        <span className="font-semibold">Current User:</span>
        <select
          value={currentUser}
          onChange={(e) => {
            setCurrentUser(e.target.value);
            setUnreadMessages(0); // Reset unread count on user switch
          }}
          className="border p-2 rounded-md"
        >
          <option value="user123">User 123</option>
          <option value="user456">User 456</option>
        </select>
        {unreadMessages > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {unreadMessages} Unread
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto border p-4 bg-white rounded-md">
        {messages.length > 0 ? (
          messages
            .filter(
              (msg) =>
                (msg.senderId === currentUser && msg.receiverId === otherUser) ||
                (msg.senderId === otherUser && msg.receiverId === currentUser)
            )
            .map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 p-2 rounded-md ${
                  msg.senderId === currentUser ? "bg-blue-200 text-right" : "bg-gray-200 text-left"
                }`}
              >
                <span className="font-semibold">
                  {msg.senderId === currentUser ? "You" : `User ${msg.senderId}`}:
                </span>{" "}
                {msg.content}
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp || "").toLocaleTimeString()}
                  {msg.status === "sent" && " ✓"}
                  {msg.status === "delivered" && " ✓✓"}
                  {msg.status === "read" && " ✅"}
                </div>
              </div>
            ))
        ) : (
          <p>No messages yet.</p>
        )}
      </div>

      {typing && <p className="text-sm text-gray-500">User is typing...</p>}

      {/* Input Box */}
      <div className="mt-4 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l-md"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
