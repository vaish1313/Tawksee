import React, { useState, useEffect, useRef } from "react";
import { User, Chat, Message } from "../types";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import axios from "axios";
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
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("funkychat-token");
  };

  // Load user's chats from API
  const loadChats = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`http://localhost:5000/api/chats/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
      if (response.data.length > 0) {
        setActiveChat(response.data[0]._id);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  // Search users
  const searchUsers = async (query: string) => {
    const token = getAuthToken();
    // If query is empty or less than 2, show all users except self
    if (!query || query.length < 2) {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/search/users?query=a&userId=${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter out self
        setSearchResults(response.data.filter((u: User) => u._id !== user._id));
        setShowSearchResults(true);
      } catch (error) {
        setSearchResults([]);
        setShowSearchResults(false);
      }
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/search/users?query=${query}&userId=${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Create new chat
  const createChat = async (participantId: string) => {
    try {
      const token = getAuthToken();
      const response = await axios.post("http://localhost:5000/api/chats/create", {
        participants: [user._id, participantId],
        type: "direct"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add new chat to the list
      setChats(prev => [...prev, response.data]);
      setActiveChat(response.data._id);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  useEffect(() => {
    // Load chats on component mount
    loadChats();

    // Set up socket connection
    socket.connect();

    // Set up socket event listeners
    socket.on("receive-message", (data) => {
      const newMessage: Message = {
        ...data,
        timestamp: new Date(data.timestamp),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === data.chatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessage: newMessage,
                unreadCount: chat._id === activeChat ? 0 : chat.unreadCount + 1,
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

    // Handle mobile responsiveness
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.off("receive-message");
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("users-online");
      socket.off("typing");
    };
  }, [user._id, activeChat]);

  const handleSendMessage = (
    content: string,
    type: "text" | "image" | "file" = "text"
  ) => {
    const messageId = uuidv4();
    const timestamp = new Date();

    const newMessage: Message = {
      id: messageId,
      senderId: user._id,
      content,
      type,
      timestamp,
      reactions: [],
    };

    socket.emit("send-message", {
      id: messageId,
      senderId: user._id,
      content,
      type,
      timestamp: timestamp.toISOString(),
      chatId: activeChat,
      reactions: [],
    });

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === activeChat
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
        userId: user._id,
      });
    }

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );

    setActiveChat(chatId);
    if (isMobile) setShowSidebar(false);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    socket.emit("message-reaction", {
      messageId,
      chatId: activeChat,
      userId: user._id,
      emoji,
    });

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === activeChat
          ? {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      reactions: [...msg.reactions, { userId: user._id, emoji }],
                    }
                  : msg
              ),
            }
          : chat
      )
    );
  };

  const currentChat = chats.find((chat) => chat._id === activeChat);

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
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
          onlineUsers={onlineUsers}
          onSearchUsers={searchUsers}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          onHideSearchResults={() => setShowSearchResults(false)}
          onCreateChat={createChat}
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
