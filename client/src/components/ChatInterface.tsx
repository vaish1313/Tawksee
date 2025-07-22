import React, { useState, useEffect, useRef } from "react";
import { User, Chat, Message } from "../types";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { generateMockChats, generateMockMessage } from "../utils/mockData";

interface ChatInterfaceProps {
  user: User;
  theme: "light" | "dark";
  onLogout: () => void;
  onToggleTheme: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  user,
  theme,
  onLogout,
  onToggleTheme,
}) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Generate mock chats
    const mockChats = generateMockChats();
    setChats(mockChats);
    if (mockChats.length > 0) {
      setActiveChat(mockChats[0].id);
    }

    // Simulate incoming messages
    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance every 5 seconds
        setChats((prevChats) => {
          const chatIndex = Math.floor(Math.random() * prevChats.length);
          const newChats = [...prevChats];
          const newMessage = generateMockMessage();
          newChats[chatIndex].messages.push(newMessage);
          newChats[chatIndex].lastMessage = newMessage;
          return newChats;
        });
      }
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" = "text"
  ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content,
      type,
      timestamp: new Date(),
      reactions: [],
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
              unreadCount: 0, // Reset unread count when user sends a message
            }
          : chat
      )
    );
  };

  const handleChatSelect = (chatId: string) => {
    // Mark chat as read when selected
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
    setActiveChat(chatId);
    if (isMobile) setShowSidebar(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === messageId
                  ? {
                      ...message,
                      reactions: [
                        ...message.reactions.filter(
                          (r) => r.userId !== user.id
                        ),
                        { userId: user.id, emoji },
                      ],
                    }
                  : message
              ),
            }
          : chat
      )
    );
  };

  const currentChat = chats.find((chat) => chat.id === activeChat);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? showSidebar
              ? "fixed inset-0 z-50"
              : "hidden"
            : "relative"
        } ${
          isMobile ? "w-full" : "w-80"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}
      >
        <ChatSidebar
          user={user}
          chats={chats}
          activeChat={activeChat}
          theme={theme}
          onChatSelect={handleChatSelect}
          onLogout={onLogout}
          onToggleTheme={onToggleTheme}
          onCloseSidebar={() => setShowSidebar(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            user={user}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            onShowSidebar={() => setShowSidebar(true)}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome to FunkyChat! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
