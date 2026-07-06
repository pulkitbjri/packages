// Types
export type {
  Chat,
  Message,
  ChatParticipantRole,
  ChatThreadType,
  ChatTheme,
  ChatListScreenProps,
  ChatRoomScreenProps,
  ChatMessagesFetchPageFn,
  ChatSendMessageFn,
  ChatMediaUploadFn,
  ChatThreadsFetchFn,
  ChatEventSubscribeFn,
  ChatRealtimeEvent,
} from './types';

export type { ChatMessagesApiNameContext } from './chatMessagesApi';
export {
  parseChatMessagesApiResponse,
  mapApiRowToMessage,
  parseChatThreadsApiResponse,
  mapApiRowToChat,
} from './chatMessagesApi';

// Chat id helpers and backward-compatible no-op shims
export type { SendMessageThreadContext } from './chatService';
export {
  getUserPartnerChatId,
} from './chatService';

// Hooks
export { useChatMessagesApi } from './hooks/useChatMessagesApi';

// UI components
export { ChatListScreen } from './components/ChatListScreen';
export { ChatRoomScreen } from './components/ChatRoomScreen';
export { MessageBubble } from './components/MessageBubble';
export { ChatInput } from './components/ChatInput';
export {
  DEFAULT_CHAT_THEME,
  PARTNER_CHAT_THEME,
  resolveTheme,
} from './components/defaultTheme';

// Notification service
export {
  requestNotificationPermission,
  getFCMToken,
  onTokenRefresh,
  onForegroundMessage,
  onNotificationOpenedApp,
  getInitialNotification,
} from './notificationService';
export type { PushNotificationMessage } from './notificationService';
