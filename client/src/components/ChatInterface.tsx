import React, { useState, useEffect, useRef } from "react";
import { User, Chat, Message } from "../types";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { generateMockChats } from "../utils/mockData";
import socket from "../utils/socket";
import { v4 as uuidv4 } from "uuid";

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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const mockChats = generateMockChats();
    setChats(mockChats);
    if (mockChats.length > 0) {
      setActiveChat(mockChats[0].id);
    }

    socket.connect();

    socket.on("receive-message", (data) => {
      const newMessage: Message = {
        ...data,
        timestamp: new Date(data.timestamp),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
                unreadCount: chat.id === activeChat ? 0 : chat.unreadCount + 1,
              }
            : chat
        )
      );
    });

    socket.on("user-joined", (data) => {
      console.log(`User ${data.userId} joined chat ${data.chatId}`);
    });

    socket.on("user-left", (data) => {
      console.log(`User ${data.userId} left chat ${data.chatId}`);
    });

    socket.on("users-online", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", (data) => {
      console.log(
        `User ${data.userId} is ${data.isTyping ? "typing" : "stopped typing"}`
      );
    });

    socket.on("message-reaction", (data) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === data.chatId
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message.id === data.messageId
                    ? {
                        ...message,
                        reactions: [
                          ...message.reactions.filter(
                            (r) => r.userId !== data.userId
                          ),
                          { userId: data.userId, emoji: data.emoji },
                        ],
                      }
                    : message
                ),
              }
            : chat
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("users-online");
      socket.off("typing");
      socket.off("message-reaction");
      socket.disconnect();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      socket.emit("join-room", {
        chatId: activeChat,
        userId: user.id,
      });
    }
  }, [activeChat, user.id]);

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
    const messageId = uuidv4();
    const timestamp = new Date();

    const newMessage: Message = {
      id: messageId,
      senderId: user.id,
      content,
      type,
      timestamp,
      reactions: [],
    };

    socket.emit("send-message", {
      id: messageId,
      senderId: user.id,
      content,
      type,
      timestamp: timestamp.toISOString(),
      chatId: activeChat,
      reactions: [],
    });

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
              unreadCount: 0,
            }
          : chat
      )
    );
  };

  const handleChatSelect = (chatId: string) => {
    if (activeChat) {
      socket.emit("leave-room", {
        chatId: activeChat,
        userId: user.id,
      });
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );

    setActiveChat(chatId);
    if (isMobile) setShowSidebar(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    socket.emit("message-reaction", {
      messageId,
      chatId: activeChat,
      userId: user.id,
      emoji,
    });

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
      <div
        className={`$${
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
          onlineUsers={onlineUsers}
        />
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatWindow
            chat={currentChat}
            user={user}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            onShowSidebar={() => setShowSidebar(true)}
            isMobile={isMobile}
            socket={socket}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Welcome to Tawksee! 🎉
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
