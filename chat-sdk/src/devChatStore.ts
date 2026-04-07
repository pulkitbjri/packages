import type { Message } from './types';

/** In-memory threads when Firestore is not configured (shared by useChat + useFirestoreChatMessaging). */
export const devMessagesByChatId: Record<string, Message[]> = {};
