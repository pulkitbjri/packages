export type ChatThreadType = 'user-partner' | 'user-cm' | 'partner-cm';
export type ChatParticipantRole = 'user' | 'partner' | 'cm';

export interface ChatBookingMeta {
  eventName?: string;
  category?: string;
  status?: string;
  eventDate?: string;
  packageName?: string;
  city?: string;
}

// ---------------------------------------------------------------------------
// Backend chat model shapes
// ---------------------------------------------------------------------------

export interface Chat {
  chatId: string;
  bookingId: number;
  threadType: ChatThreadType;
  participantIds: string[];
  participantNames: Record<string, string>;
  participantRoles: Record<string, ChatParticipantRole>;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
  bookingMeta: ChatBookingMeta;
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
  currentUserRole: ChatParticipantRole;
  onChatPress: (chat: Chat, otherPartyName: string) => void;
  loadChatsViaApi?: {
    fetchList: ChatThreadsFetchFn;
    subscribeToEvents?: ChatEventSubscribeFn;
    pollIntervalMs?: number;
  };
  theme?: Partial<ChatTheme>;
}

/** Host-provided fetcher for GET /api/v1/chat/{chatId}/messages. */
export type ChatMessagesFetchPageFn = (args: {
  chatId: string;
  limit: number;
  after: string | null;
}) => Promise<{ messages: Message[]; nextCursor: string | null }>;

/** Host-provided sender for POST /api/v1/chat/{chatId}/messages. */
export type ChatSendMessageFn = (args: {
  chatId: string;
  text: string;
  imageUrl?: string;
  mediaObjectPath?: string;
  mediaContentType?: string;
}) => Promise<void>;

export type ChatMediaUploadFn = (args: {
  chatId: string;
  localUri: string;
}) => Promise<{
  imageUrl: string;
  objectPath?: string;
  contentType?: string;
}>;

export type ChatThreadsFetchFn = () => Promise<{
  chats: Chat[];
  totalUnread: number;
}>;

export type ChatRealtimeEvent = {
  type: string;
  chat?: Chat;
  message?: Message;
};

export type ChatEventSubscribeFn = (
  onEvent: (event: ChatRealtimeEvent) => void,
) => () => void;

export interface ChatRoomScreenProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  otherPartyRole?: ChatParticipantRole;
  bookingId?: number;
  bookingLabel?: string;
  otherUserId?: string;
  threadParticipantIds?: string[];
  loadMessagesViaApi?: {
    fetchPage: ChatMessagesFetchPageFn;
    sendMessage?: ChatSendMessageFn;
    uploadMedia?: ChatMediaUploadFn;
    subscribeToEvents?: ChatEventSubscribeFn;
    markRead?: (chatId: string) => Promise<void>;
    pollIntervalMs?: number;
    limit?: number;
  };
  onBack?: () => void;
  theme?: Partial<ChatTheme>;
}
