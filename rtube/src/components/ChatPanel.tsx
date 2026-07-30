import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket/socket";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import axios from "axios";
import { format } from "date-fns";
interface ChatMessage {
  sender: any;
  senderName?: string;
  text: string;
  time: string;
  type?: "chat" | "join" | "leave";
}

interface ChatPanelProps {
  partyCode: string;
  user?: {
    name?: string;
    email?: string;
    [key: string]: any;
  } | null;
}

export default function ChatPanel({ partyCode }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const { user } = useUser();
  const senderName = user?.name || user?.email || "Anonymous";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const loadMessages = async () => {
    try {
      const res = await axiosInstance.get(`/watch-party/${partyCode}/messages`);
      setMessages(res.data.messages || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  loadMessages();
}, [partyCode]);


  useEffect(() => {
    const handleMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive-message", handleMessage);

    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, []);

  useEffect(() => {
    const handleSystemMessage = (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
    };

    socket.on("system-message", handleSystemMessage);

    return () => {
        socket.off("system-message", handleSystemMessage);
    };
}, []);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages]);

  const sendMessage = () => {
    if (!chatMessage.trim()) return;

    socket.emit("send-message", {
      partyCode,
      message: {
          senderId: user?._id,
        sender: user?.name || "Guest",
        text: chatMessage,
        time: new Date().toLocaleTimeString(),
      },
    });

    setChatMessage("");
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="font-bold mb-3">Live Chat</h2>
<div className="h-80 overflow-y-auto bg-zinc-950 border border-zinc-700 rounded-lg p-3 mb-3">
  {messages.map((msg: any, index: number) => {
    const isOwnMessage =
  String(msg.sender?._id || msg.sender) === String(user?._id);

    if (msg.type === "join") {
      return (
        <div
          key={index}
          className="text-center text-green-600 text-xs my-2"
        >
          🎉 {msg.text}
        </div>
      );
    }

    if (msg.type === "leave") {
      return (
        <div
          key={index}
          className="text-center text-red-600 text-xs my-2"
        >
          👋 {msg.text}
        </div>
      );
    }

    return (
<div
  key={index}
className={`flex mb-3 ${
  isOwnMessage ? "justify-end" : "justify-start"
}`}
>
  <div
  className={`max-w-[80%] rounded-xl px-4 py-3 shadow ${
  isOwnMessage
    ? "bg-red-600 text-white"
    : "bg-zinc-800 text-white border border-zinc-700"
}`}
  >
    <div className="flex items-center justify-between">
      <strong
  className={`text-sm font-semibold ${
    isOwnMessage
      ? "text-red-100"
      : "text-red-400"
  }`}
>
        {isOwnMessage ? "You" : msg.senderName}
      </strong>

      <span
      className={`text-xs ${
  isOwnMessage
    ? "text-red-100"
    : "text-zinc-400"
}`}
      >
        {msg.createdAt
          ? format(new Date(msg.createdAt), "hh:mm a")
          : ""}
      </span>
    </div>

<p className="mt-2 break-words leading-relaxed">
        {msg.text}
    </p>
  </div>
</div>
    );
  })}

  <div ref={messagesEndRef} />
</div>

      <div className="flex gap-2">
        <input
       className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          placeholder="Type a message..."
        />

        <button
          onClick={sendMessage}
className="bg-red-600 hover:bg-red-700 transition px-5 rounded-xl text-white font-medium"        >
          Send
        </button>
      </div>
    </div>
  );
}