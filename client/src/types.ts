export interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
  statusEmoji: string;
  phone?: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "file" | "sticker" | "emoji" | "audio";
  timestamp: Date;
  reactions: Reaction[];
  replyTo?: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface Chat {
  id: string;
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
