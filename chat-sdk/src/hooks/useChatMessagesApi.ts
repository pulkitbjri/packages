import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessagesFetchPageFn, Message } from '../types';
import { markMessagesRead } from '../chatService';
import { firestoreReady } from '../firebase';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const DEFAULT_POLL_MS = 10_000;

/**
 * Loads chat messages from GET /api/v1/chat/{chatId}/messages (via host-provided fetcher).
 */
export function useChatMessagesApi(
  chatId: string | null,
  currentUserId: string,
  fetchPage: ChatMessagesFetchPageFn,
  options?: {
    pollIntervalMs?: number;
    enabled?: boolean;
    /** Page size for each request (default 50, max 100). */
    limit?: number;
  },
): {
  messages: Message[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const loadingMore = useRef(false);
  const enabled = options?.enabled !== false;
  const pollMs = options?.pollIntervalMs ?? DEFAULT_POLL_MS;
  const pageLimit = Math.min(
    Math.max(options?.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  const doFetch = useCallback(
    async (mode: 'initial' | 'poll' | 'pull') => {
      if (!chatId || !enabled) {
        setMessages([]);
        setNextCursor(null);
        setLoading(false);
        return;
      }
      const limit = pageLimit;
      if (mode === 'initial') setLoading(true);
      if (mode === 'pull') setRefreshing(true);
      try {
        const { messages: page, nextCursor: cursor } = await fetchPage({
          chatId,
          limit,
          after: null,
        });
        setMessages(page);
        setNextCursor(cursor);
        if (firestoreReady && page.length > 0) {
          const last = page[page.length - 1];
          if (String(last.senderId) !== String(currentUserId)) {
            markMessagesRead(chatId, currentUserId).catch(() => {});
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [chatId, currentUserId, enabled, fetchPage, pageLimit],
  );

  useEffect(() => {
    void doFetch('initial');
  }, [doFetch]);

  useEffect(() => {
    if (!chatId || !enabled || pollMs <= 0) return;
    const t = setInterval(() => {
      void doFetch('poll');
    }, pollMs);
    return () => clearInterval(t);
  }, [chatId, enabled, pollMs, doFetch]);

  const refetch = useCallback(async () => {
    await doFetch('pull');
  }, [doFetch]);

  const loadMore = useCallback(async () => {
    if (!chatId || !enabled || loadingMore.current || !nextCursor) return;
    loadingMore.current = true;
    try {
      const limit = pageLimit;
      const { messages: older, nextCursor: cursor } = await fetchPage({
        chatId,
        limit,
        after: nextCursor,
      });
      if (older.length === 0) {
        setNextCursor(null);
        return;
      }
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.messageId));
        const merged = [...older.filter((m) => !seen.has(m.messageId)), ...prev];
        return merged;
      });
      setNextCursor(cursor);
    } finally {
      loadingMore.current = false;
    }
  }, [chatId, enabled, fetchPage, nextCursor, pageLimit]);

  const hasMore = Boolean(nextCursor);

  return {
    messages,
    loading,
    refreshing,
    hasMore,
    loadMore,
    refetch,
  };
}
