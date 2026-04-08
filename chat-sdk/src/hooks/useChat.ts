import { useEffect, useState, useCallback, useRef } from 'react';
import type { Message } from '../types';
import {
  subscribeToMessages,
  markMessagesRead,
  loadEarlierMessages,
  type SendMessageThreadContext,
} from '../chatService';
import { firestoreReady } from '../firebase';
import { useFirestoreChatMessaging } from './useFirestoreChatMessaging';

interface UseChatReturn {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  send: (text: string) => Promise<void>;
  sendImage: (localUri: string, caption?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useChat(
  chatId: string | null,
  currentUserId: string,
  currentUserName: string,
  thread?: SendMessageThreadContext | null,
): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingMore = useRef(false);

  const { send, sendImage, sending } = useFirestoreChatMessaging(
    chatId,
    currentUserId,
    currentUserName,
    thread ?? undefined,
  );

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    if (!firestoreReady) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const unsubscribe = subscribeToMessages(chatId, (msgs) => {
        setMessages(msgs);
        setLoading(false);
      });

      markMessagesRead(chatId, currentUserId).catch(() => {});

      return unsubscribe;
    } catch (error) {
      console.error('[useChat] Failed to subscribe to messages:', error);
      setMessages([]);
      setLoading(false);
      return () => {};
    }
  }, [chatId, currentUserId]);

  // Re-mark read whenever new messages arrive from the other party
  useEffect(() => {
    if (!chatId || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.senderId !== currentUserId) {
      markMessagesRead(chatId, currentUserId).catch(() => {});
    }
  }, [chatId, currentUserId, messages.length]);

  const loadMore = useCallback(async () => {
    if (!chatId || loadingMore.current || messages.length === 0 || !hasMore) return;

    if (!firestoreReady) {
      setHasMore(false);
      return;
    }

    loadingMore.current = true;
    try {
      const earliest = messages[0];
      const older = await loadEarlierMessages(chatId, earliest.createdAt);
      if (older.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...older, ...prev]);
      }
    } finally {
      loadingMore.current = false;
    }
  }, [chatId, messages, hasMore]);

  return { messages, loading, sending, send, sendImage, loadMore, hasMore };
}
