// Types
export type {
  Chat,
  Message,
  ChatDoc,
  MessageDoc,
  ChatTheme,
  ChatListScreenProps,
  ChatRoomScreenProps,
  ChatMessagesFetchPageFn,
} from './types';

export type { ChatMessagesApiNameContext } from './chatMessagesApi';
export { parseChatMessagesApiResponse, mapApiRowToMessage } from './chatMessagesApi';

// Chat service (Firestore operations)
export type { FirestoreListenOptions, SendMessageThreadContext } from './chatService';
export {
  createOrGetChat,
  getUserPartnerChatId,
  isFirestorePermissionError,
  isStoragePermissionError,
  sendMessage,
  subscribeToMessages,
  subscribeToChats,
  markMessagesRead,
  uploadChatImage,
  loadEarlierMessages,
  subscribeToTotalUnread,
} from './chatService';

export {
  USE_LIVE_FIRESTORE_CHAT,
  configureChatSdk,
  firestoreReady,
} from './firebase';

// Hooks
export { useChat } from './hooks/useChat';
export { useChatList } from './hooks/useChatList';
export { useChatMessagesApi } from './hooks/useChatMessagesApi';
export { useFirestoreChatMessaging } from './hooks/useFirestoreChatMessaging';

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
