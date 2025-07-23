import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Settings,
  Moon,
  Sun,
  LogOut,
  X,
  Users,
} from "lucide-react";
import { User, Chat } from "../types";
import socket from "../utils/socket";

interface ChatSidebarProps {
  user: User;
  chats: Chat[];
  activeChat: string;
  theme: "light" | "dark";
  onChatSelect: (chatId: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  onCloseSidebar: () => void;
  isMobile: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  user,
  chats,
  activeChat,
  theme,
  onChatSelect,
  onLogout,
  onToggleTheme,
  onCloseSidebar,
  isMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (user && user.id) {
      socket.emit("join", user.id);
    }

    socket.on("updateOnlineUsers", (ids: string[]) => {
      setOnlineUsers(ids);
    });

    return () => {
      socket.off("updateOnlineUsers");
    };
  }, [user]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                {user.statusEmoji} Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMobile && (
              <button
                onClick={onCloseSidebar}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-2">
            <button
              onClick={onToggleTheme}
              className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between p-2 mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Chats
            </h3>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {filteredChats.map((chat) => {
            const otherParticipant = chat.participants.find(
              (p) => p.id !== user.id
            );
            const displayName =
              chat.name || otherParticipant?.name || "Unknown";
            const displayAvatar = chat.avatar || otherParticipant?.avatar || "";
            const isActive = chat.id === activeChat;
            const isOnline = onlineUsers.includes(otherParticipant?.id || "");

            return (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full p-3 rounded-xl mb-2 transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-[0.98]"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {chat.type === "group" && (
                      <div className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-1">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {chat.type === "direct" && isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={`font-semibold truncate ${
                          isActive
                            ? "text-white"
                            : "text-gray-800 dark:text-white"
                        }`}
                      >
                        {displayName}
                      </h4>
                      {chat.lastMessage && (
                        <span
                          className={`text-xs ${
                            isActive
                              ? "text-purple-100"
                              : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate ${
                          isActive
                            ? "text-purple-100"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {chat.lastMessage?.content || "No messages yet"}
                      </p>
                      {chat.unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
