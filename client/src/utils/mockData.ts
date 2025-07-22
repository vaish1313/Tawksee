import { Chat, Message, User } from "../types";

const mockUsers: User[] = [
  {
    id: "2",
    name: "Emma Wilson",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    status: "Living my best life! ✨",
    statusEmoji: "✨",
    isOnline: true,
  },
  {
    id: "3",
    name: "Alex Chen",
    avatar:
      "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150",
    status: "Coding wizard 🧙‍♂️",
    statusEmoji: "🚀",
    isOnline: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    name: "Sarah Johnson",
    avatar:
      "https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg?auto=compress&cs=tinysrgb&w=150",
    status: "Adventure awaits! 🏔️",
    statusEmoji: "🌟",
    isOnline: true,
  },
  {
    id: "5",
    name: "Mike Rodriguez",
    avatar:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    status: "Music is life 🎵",
    statusEmoji: "🎵",
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "6",
    name: "Lisa Park",
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
    status: "Coffee lover ☕",
    statusEmoji: "☕",
    isOnline: true,
  },
];

const sampleMessages = [
  "Hey! How's it going? 😊",
  "Just finished an amazing workout! 💪",
  "Anyone up for coffee later? ☕",
  "This weather is perfect for a walk! 🌞",
  "Just saw the funniest meme 😂",
  "Working on something exciting! ✨",
  "Pizza night tonight? 🍕",
  "Can't wait for the weekend! 🎉",
  "Just finished reading an amazing book 📚",
  "Anyone watching the game tonight? ⚽",
  "Beautiful sunset today! 🌅",
  "Time for some music 🎵",
  "Trying out a new recipe today 👨‍🍳",
  "Just got back from vacation! ✈️",
  "Movie recommendations anyone? 🎬",
  "📷 Image: vacation_photo.jpg",
  "📎 File: presentation.pdf (2.5 MB)",
  "📸 Photo taken with camera",
];

export const generateMockMessage = (): Message => {
  const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
  const messageContent =
    sampleMessages[Math.floor(Math.random() * sampleMessages.length)];

  let messageType: "text" | "image" | "file" = "text";
  if (messageContent.includes("📷") || messageContent.includes("📸")) {
    messageType = "image";
  } else if (messageContent.includes("📎")) {
    messageType = "file";
  }

  return {
    id: Date.now().toString() + Math.random(),
    senderId: randomUser.id,
    content: messageContent,
    type: messageType,
    timestamp: new Date(),
    reactions: [],
  };
};

export const generateMockChats = (): Chat[] => {
  const chats: Chat[] = [];

  // Direct chats
  mockUsers.forEach((user, index) => {
    const messages: Message[] = [];

    // Generate some messages for each chat
    for (let i = 0; i < Math.floor(Math.random() * 10) + 3; i++) {
      messages.push({
        id: `msg-${user.id}-${i}`,
        senderId: Math.random() > 0.5 ? user.id : "1", // Mix of user and current user messages
        content:
          sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        type: "text",
        timestamp: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last week
        reactions: Math.random() > 0.8 ? [{ userId: "1", emoji: "❤️" }] : [],
      });
    }

    // Sort messages by timestamp
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    chats.push({
      id: `chat-${user.id}`,
      type: "direct",
      participants: [user],
      messages,
      lastMessage: messages[messages.length - 1],
      unreadCount: Math.floor(Math.random() * 5),
      isTyping: {},
    });
  });

  // Group chat
  chats.push({
    id: "group-1",
    name: "Funky Squad 🚀",
    type: "group",
    avatar:
      "https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpg?auto=compress&cs=tinysrgb&w=150",
    participants: mockUsers.slice(0, 3),
    messages: [
      {
        id: "group-msg-1",
        senderId: "2",
        content: "Hey everyone! Ready for the weekend? 🎉",
        type: "text",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reactions: [{ userId: "3", emoji: "🎉" }],
      },
      {
        id: "group-msg-2",
        senderId: "3",
        content: "Absolutely! Any plans?",
        type: "text",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        reactions: [],
      },
      {
        id: "group-msg-3",
        senderId: "4",
        content: "How about a picnic in the park? 🌳",
        type: "text",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        reactions: [
          { userId: "2", emoji: "👍" },
          { userId: "3", emoji: "❤️" },
        ],
      },
    ],
    lastMessage: {
      id: "group-msg-3",
      senderId: "4",
      content: "How about a picnic in the park? 🌳",
      type: "text",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      reactions: [],
    },
    unreadCount: 3,
    isTyping: {},
  });

  // Sort chats by last message timestamp
  chats.sort((a, b) => {
    const aTime = a.lastMessage?.timestamp.getTime() || 0;
    const bTime = b.lastMessage?.timestamp.getTime() || 0;
    return bTime - aTime;
  });

  return chats;
};
