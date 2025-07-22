import React, { useState } from "react";
import { FileText, Image, Download } from "lucide-react";
import { Message } from "../types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onReaction: (emoji: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  onReaction,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const quickReactions = ["❤️", "😂", "😮", "😢", "😡", "👍"];

  const renderMessageContent = () => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 flex items-center gap-3">
              <Image className="w-8 h-8 text-purple-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Image</p>
                <p className="text-xs opacity-75">
                  {message.content.replace("📷 Image: ", "")}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      case "file":
        return (
          <div className="space-y-2">
            <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-sm">Document</p>
                <p className="text-xs opacity-75">
                  {message.content.replace("📎 File: ", "")}
                </p>
              </div>
              <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      default:
        return <p className="break-words">{message.content}</p>;
    }
  };
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
      <div
        className={`max-w-xs lg:max-w-md relative ${
          isOwn ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
            isOwn
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-sm"
          } ${showReactions ? "mb-8" : ""}`}
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {renderMessageContent()}
          <div className="flex items-center justify-between mt-2">
            <span
              className={`text-xs ${
                isOwn ? "text-purple-100" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatTime(message.timestamp)}
            </span>
            {message.reactions.length > 0 && (
              <div className="flex gap-1">
                {message.reactions.slice(0, 3).map((reaction, index) => (
                  <span key={index} className="text-sm">
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Reactions */}
        {showReactions && (
          <div
            className={`absolute top-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-1 z-10 ${
              isOwn ? "right-0" : "left-0"
            }`}
          >
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReaction(emoji);
                  setShowReactions(false);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Reaction Button */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className={`absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isOwn ? "-left-10" : "-right-10"
          }`}
        >
          <span className="text-sm">😊</span>
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;
