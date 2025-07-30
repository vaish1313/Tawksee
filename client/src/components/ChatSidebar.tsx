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
  UserPlus,
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
  onlineUsers: string[];
  onSearchUsers: (query: string) => void;
  searchResults: User[];
  showSearchResults: boolean;
  onHideSearchResults: () => void;
  onCreateChat: (participantId: string) => void;
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
  onlineUsers,
  onSearchUsers,
  searchResults,
  showSearchResults,
  onHideSearchResults,
  onCreateChat,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      socket.emit("join", user._id);
    }

    socket.on("updateOnlineUsers", (ids: string[]) => {
      // This will be handled by the parent component
    });

    return () => {
      socket.off("updateOnlineUsers");
    };
  }, [user]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.participants.some((p) =>
        p && p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchUsers(value);
  };

  const handleSearchFocus = () => {
    onSearchUsers(""); // Show all users except self
  };

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
            placeholder="Search chats or users..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
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

      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
            Search Results
          </h3>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <button
                key={result._id}
                onClick={() => onCreateChat(result._id)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <img
                  src={result.avatar}
                  alt={result.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-800 dark:text-white">
                    {result.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{result.username}
                  </p>
                </div>
                <UserPlus className="w-4 h-4 text-gray-400" />
              </button>
            ))}
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
              (p) => p && p._id !== user._id
            );
            const displayName =
              chat.name || otherParticipant?.name || "Unknown";
            const displayAvatar = chat.avatar || otherParticipant?.avatar || "";
            const isActive = chat._id === activeChat;
            const isOnline = onlineUsers.includes(otherParticipant?._id || "");

            return (
              <button
                key={chat._id}
                onClick={() => onChatSelect(chat._id)}
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

                  <div className="flex-1 text-left">
                    <h4 className="font-medium">{displayName}</h4>
                    {chat.lastMessage && (
                      <p className="text-sm opacity-75 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {chat.lastMessage && (
                      <p className="text-xs opacity-75">
                        {formatTime(chat.lastMessage.timestamp)}
                      </p>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className="mt-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                      </div>
                    )}
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
