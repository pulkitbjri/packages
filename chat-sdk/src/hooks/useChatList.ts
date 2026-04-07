import { useEffect, useRef, useState, useCallback } from 'react';
import type { Chat } from '../types';
import { subscribeToChats, subscribeToTotalUnread } from '../chatService';
import { firestoreReady } from '../firebase';
import { buildDemoChatsForParticipant } from '../demoChatData';

interface UseChatListReturn {
  chats: Chat[];
  loading: boolean;
  totalUnread: number;
}

export function useChatList(participantId: string | null): UseChatListReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);
  const usedPermissionFallback = useRef(false);

  const applyDemoAfterPermissionDenied = useCallback((pid: string) => {
    if (usedPermissionFallback.current) return;
    usedPermissionFallback.current = true;
    setChats(buildDemoChatsForParticipant(pid));
    setTotalUnread(1);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!participantId) {
      setChats([]);
      setLoading(false);
      return;
    }

    usedPermissionFallback.current = false;

    if (!firestoreReady) {
      setChats(buildDemoChatsForParticipant(participantId));
      setTotalUnread(1);
      setLoading(false);
      return;
    }

    setLoading(true);

    let unsubChats: (() => void) | null = null;
    let unsubUnread: (() => void) | null = null;

    try {
      const onPermissionDenied = () =>
        applyDemoAfterPermissionDenied(participantId);

      unsubChats = subscribeToChats(
        participantId,
        (data) => {
          if (usedPermissionFallback.current) return;
          setChats(data);
          setLoading(false);
        },
        { onPermissionDenied },
      );

      unsubUnread = subscribeToTotalUnread(participantId, (count) => {
        if (usedPermissionFallback.current) return;
        setTotalUnread(count);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[useChatList] Firestore subscription failed, using demo data:', error);
      applyDemoAfterPermissionDenied(participantId);
    }

    return () => {
      if (unsubChats) unsubChats();
      if (unsubUnread) unsubUnread();
    };
  }, [participantId, applyDemoAfterPermissionDenied]);

  return { chats, loading, totalUnread };
}
