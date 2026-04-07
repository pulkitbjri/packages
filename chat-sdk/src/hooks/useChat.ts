import { useEffect, useState, useCallback, useRef } from 'react';
import type { Message } from '../types';
import {
  subscribeToMessages,
  markMessagesRead,
  loadEarlierMessages,
  type SendMessageThreadContext,
} from '../chatService';
import { firestoreReady } from '../firebase';
import { devMessagesByChatId } from '../devChatStore';
import { useFirestoreChatMessaging } from './useFirestoreChatMessaging';

function getDemoMessagesForChat(chatId: string): Message[] {
  // Extract partner info from chatId to provide contextual demo messages
  if (chatId.includes('priya_sharma')) {
    return [
      {
        messageId: 'priya-1',
        text: 'Hi! I saw your profile and found it really interesting 😊',
        senderId: 'priya_sharma',
        senderName: 'Priya Sharma',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
        readBy: ['priya_sharma'],
      },
      {
        messageId: 'priya-2',
        text: 'I love that you enjoy traveling! I just got back from Goa.',
        senderId: 'priya_sharma',
        senderName: 'Priya Sharma',
        createdAt: new Date(Date.now() - 240000), // 4 minutes ago
        readBy: ['priya_sharma'],
      },
      {
        messageId: 'priya-3',
        text: 'Would love to know more about your hobbies! 🌟',
        senderId: 'priya_sharma',
        senderName: 'Priya Sharma',
        createdAt: new Date(Date.now() - 180000), // 3 minutes ago
        readBy: ['priya_sharma'],
      },
    ];
  }
  
  if (chatId.includes('rahul_verma')) {
    return [
      {
        messageId: 'rahul-1',
        text: 'Hey! Thanks for connecting with me.',
        senderId: 'rahul_verma',
        senderName: 'Rahul Verma',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        readBy: ['rahul_verma'],
      },
      {
        messageId: 'rahul-2',
        text: 'I noticed we both work in tech. What kind of projects do you work on?',
        senderId: 'rahul_verma',
        senderName: 'Rahul Verma',
        createdAt: new Date(Date.now() - 3300000), // 55 minutes ago
        readBy: ['rahul_verma'],
      },
    ];
  }
  
  // Default demo messages for any other chat
  return [
    {
      messageId: 'demo-1',
      text: 'Hello! This is a demo conversation.',
      senderId: 'demo_partner',
      senderName: 'Demo Partner',
      createdAt: new Date(Date.now() - 120000), // 2 minutes ago
      readBy: ['demo_partner'],
    },
    {
      messageId: 'demo-2',
      text: 'You can send messages and they will appear here instantly in demo mode!',
      senderId: 'demo_partner',
      senderName: 'Demo Partner',
      createdAt: new Date(Date.now() - 60000), // 1 minute ago
      readBy: ['demo_partner'],
    },
    {
      messageId: 'demo-3',
      text: 'Configure Firestore security rules to enable real-time chat functionality.',
      senderId: 'demo_partner',
      senderName: 'Demo Partner',
      createdAt: new Date(),
      readBy: ['demo_partner'],
    },
  ];
}

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
    { syncDevMessages: setMessages },
  );

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    if (!firestoreReady) {
      // Dev mode: hydrate from in-memory messages or provide demo messages
      const existing = devMessagesByChatId[chatId];
      if (existing && existing.length > 0) {
        setMessages(existing);
      } else {
        // First time loading this chat, provide demo messages
        const demoMessages = getDemoMessagesForChat(chatId);
        devMessagesByChatId[chatId] = demoMessages;
        setMessages(demoMessages);
      }
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
      // Fallback to demo messages if Firestore fails
      const demoMessages: Message[] = getDemoMessagesForChat(chatId);
      setMessages(demoMessages);
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
      // Dev mode: we don't have persisted history.
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
