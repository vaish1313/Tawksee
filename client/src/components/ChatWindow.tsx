import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Menu,
} from "lucide-react";
import { User, Chat } from "../types";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "./EmojiPicker";
import TypingIndicator from "./TypingIndicator";
import MediaPicker from "./MediaPicker";
import CallInterface from "./CallInterface";
import { Socket } from "socket.io-client";

interface ChatWindowProps {
  chat: Chat;
  user: User;
  onSendMessage: (content: string, type?: "text" | "image" | "file") => void;
  onReaction: (messageId: string, emoji: string) => void;
  onShowSidebar: () => void;
  isMobile: boolean;
  socket: Socket; // Added socket prop
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  user,
  onSendMessage,
  onReaction,
  onShowSidebar,
  isMobile,
  socket,
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeCall, setActiveCall] = useState<"audio" | "video" | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState<string[]>([]); // Track who's typing
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const otherParticipant = chat.participants.find((p) => p && p._id !== user._id);
  const displayName = chat.name || otherParticipant?.name || "Unknown";
  const displayAvatar = chat.avatar || otherParticipant?.avatar || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Socket listeners for typing indicators
  useEffect(() => {
    const handleTyping = (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
      userName: string;
    }) => {
      if (data.chatId === chat._id && data.userId !== user._id) {
        if (data.isTyping) {
          setOthersTyping((prev) =>
            prev.includes(data.userName) ? prev : [...prev, data.userName]
          );
        } else {
          setOthersTyping((prev) =>
            prev.filter((name) => name !== data.userName)
          );
        }
      }
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stopped-typing", handleTyping);

    return () => {
      socket.off("user-typing");
      socket.off("user-stopped-typing");
    };
  }, [chat._id, user._id, socket]);

  // Handle typing indicator emission
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Emit typing start
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socket.emit("typing-start", {
        chatId: chat._id,
        userId: user._id,
        userName: user.name,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit("typing-stop", {
          chatId: chat._id,
          userId: user._id,
          userName: user.name,
        });
      }
    }, 1000); // Stop typing after 1 second of inactivity
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        socket.emit("typing-stop", {
          chatId: chat._id,
          userId: user._id,
          userName: user.name,
        });
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith("image/") ? "image" : "file";
      const fileName = file.name;
      const fileSize = (file.size / 1024 / 1024).toFixed(2);

      if (fileType === "image") {
        onSendMessage(`📷 Image: ${fileName}`, "image");
      } else {
        onSendMessage(`📎 File: ${fileName} (${fileSize} MB)`, "file");
      }
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMediaSelect = (type: "camera" | "gallery" | "file" | "audio") => {
    setShowMediaPicker(false);

    if (type === "camera") {
      onSendMessage("📸 Photo taken with camera", "image");
    } else if (type === "gallery" || type === "file") {
      fileInputRef.current?.click();
    } else if (type === "audio") {
      // TODO: Handle audio selection or just log it for now
      console.log("Audio selected");
    }
  };

  const startCall = (type: "audio" | "video") => {
    setActiveCall(type);

    // Emit call initiation to other participants
    socket.emit("call-initiate", {
      chatId: chat._id,
      callType: type,
      initiatorId: user._id,
      initiatorName: user.name,
    });
  };

  const endCall = () => {
    setActiveCall(null);

    // Emit call end to other participants
    socket.emit("call-end", {
      chatId: chat._id,
      userId: user._id,
    });
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (activeCall) {
    return (
      <CallInterface
        callType={activeCall}
        participant={
          otherParticipant || {
            _id: "0",
            username: "unknown",
            name: displayName,
            avatar: displayAvatar,
            status: "",
            statusEmoji: "",
            isOnline: true,
          }
        }
        onEndCall={endCall}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={onShowSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {displayName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {otherParticipant?.isOnline ? "Online" : "Last seen recently"}
                {othersTyping.length > 0 && (
                  <span className="text-green-500 ml-2">typing...</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startCall("audio")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hover:scale-110 transform"
            >
              <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => startCall("video")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hover:scale-110 transform"
            >
              <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:to-purple-900/20">
        <div className="space-y-4">
          {chat.messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user._id}
              onReaction={(emoji) => onReaction(msg.id, emoji)}
            />
          ))}

          {/* Typing Indicator - Show when others are typing */}
          {othersTyping.length > 0 && (
            <TypingIndicator
              avatar={displayAvatar}
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowMediaPicker(!showMediaPicker)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hover:scale-110 transform"
            >
              <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a funky message..."
                className="w-full p-3 pr-12 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {showMediaPicker && (
                <div className="absolute bottom-full left-0 mb-2">
                  <MediaPicker onMediaSelect={handleMediaSelect} />
                </div>
              )}
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatWindow;
