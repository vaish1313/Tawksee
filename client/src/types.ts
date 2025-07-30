export interface User {
  _id: string;
  username: string;
  name: string;
  avatar: string;
  status: string;
  statusEmoji: string;
  contact?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file";
  timestamp: Date;
  reactions: Array<{
    userId: string;
    emoji: string;
  }>;
}

export interface Chat {
  _id: string;
  name?: string;
  type: "direct" | "group";
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  isTyping: { [userId: string]: boolean };
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  isTyping: boolean;
}
