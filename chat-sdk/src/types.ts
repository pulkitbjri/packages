import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ---------------------------------------------------------------------------
// Firestore document shapes
// ---------------------------------------------------------------------------

export interface Chat {
  chatId: string;
  type: 'user-partner';
  userId: string;
  partnerId: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
}

export interface Message {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  readBy: string[];
}

// ---------------------------------------------------------------------------
// Firestore raw document (Timestamps before conversion)
// ---------------------------------------------------------------------------

export interface ChatDoc {
  type: 'user-partner';
  userId: string;
  partnerId: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: FirebaseFirestoreTypes.Timestamp;
  unreadCount: Record<string, number>;
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

export interface MessageDoc {
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  createdAt: FirebaseFirestoreTypes.Timestamp;
  readBy: string[];
}

// ---------------------------------------------------------------------------
// Theme contract for consuming apps
// ---------------------------------------------------------------------------

export interface ChatTheme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  sentBubble: string;
  sentBubbleText: string;
  receivedBubble: string;
  receivedBubbleText: string;
  inputBackground: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Component prop types
// ---------------------------------------------------------------------------

export interface ChatListScreenProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'user' | 'partner';
  onChatPress: (chatId: string, otherPartyName: string) => void;
  theme?: Partial<ChatTheme>;
}

/** Host-provided fetcher for GET /api/v1/chat/{chatId}/messages. */
export type ChatMessagesFetchPageFn = (args: {
  chatId: string;
  limit: number;
  after: string | null;
}) => Promise<{ messages: Message[]; nextCursor: string | null }>;

export interface ChatRoomScreenProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  /** Backend / list user id for the other party (e.g. `userId` from GET /partners/me/users). Used to seed Firestore `participantIds`. */
  otherUserId?: string;
  /**
   * Optional explicit participant id list from backend (same strings as Firestore rules / JWT).
   * When set, merged with `currentUserId` for thread context.
   */
  threadParticipantIds?: string[];
  /**
   * Load the message list from the REST API while sends still go through Firestore (when configured).
   */
  loadMessagesViaApi?: {
    fetchPage: ChatMessagesFetchPageFn;
    pollIntervalMs?: number;
    limit?: number;
  };
  onBack?: () => void;
  theme?: Partial<ChatTheme>;
}
