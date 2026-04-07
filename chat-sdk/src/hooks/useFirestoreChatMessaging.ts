import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import type { Message } from '../types';
import {
  sendMessage,
  uploadChatImage,
  type SendMessageThreadContext,
} from '../chatService';
import { firestoreReady } from '../firebase';
import { devMessagesByChatId } from '../devChatStore';

function getDevThread(chatId: string): Message[] {
  return devMessagesByChatId[chatId] ?? [];
}

function setDevThread(chatId: string, msgs: Message[]) {
  devMessagesByChatId[chatId] = msgs;
}

/**
 * Firestore send/upload only (no message subscription). Used with REST-backed message lists.
 */
export function useFirestoreChatMessaging(
  chatId: string | null,
  currentUserId: string,
  currentUserName: string,
  thread: SendMessageThreadContext | null | undefined,
  options?: {
    onSendComplete?: () => void | Promise<void>;
    /** When set, dev-mode (no Firestore) updates sync into the parent message state */
    syncDevMessages?: Dispatch<SetStateAction<Message[]>>;
  },
): {
  sending: boolean;
  send: (text: string) => Promise<void>;
  sendImage: (localUri: string, caption?: string) => Promise<void>;
} {
  const [sending, setSending] = useState(false);
  const onSendComplete = options?.onSendComplete;
  const syncDev = options?.syncDevMessages;

  const send = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;
      setSending(true);
      try {
        if (!firestoreReady) {
          const newMsg: Message = {
            messageId: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            senderId: currentUserId,
            senderName: currentUserName,
            text: text.trim(),
            createdAt: new Date(),
            readBy: [currentUserId],
          };
          const prev = getDevThread(chatId);
          const next = [...prev, newMsg];
          setDevThread(chatId, next);
          syncDev?.(next);
          await onSendComplete?.();
          return;
        }

        await sendMessage(
          chatId,
          currentUserId,
          currentUserName,
          text.trim(),
          undefined,
          thread ?? undefined,
        );
        await onSendComplete?.();
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUserId, currentUserName, thread, onSendComplete, syncDev],
  );

  const sendImage = useCallback(
    async (localUri: string, caption = '') => {
      if (!chatId) return;
      setSending(true);
      try {
        if (!firestoreReady) {
          const newMsg: Message = {
            messageId: `dev_${Date.now()}_${Math.random().toString(16).slice(2)}`,
            senderId: currentUserId,
            senderName: currentUserName,
            text: caption?.trim() ? caption.trim() : '📷 Photo',
            createdAt: new Date(),
            readBy: [currentUserId],
          };
          const prev = getDevThread(chatId);
          const next = [...prev, newMsg];
          setDevThread(chatId, next);
          syncDev?.(next);
          await onSendComplete?.();
          return;
        }

        const url = await uploadChatImage(chatId, localUri);
        await sendMessage(
          chatId,
          currentUserId,
          currentUserName,
          caption,
          url,
          thread ?? undefined,
        );
        await onSendComplete?.();
      } finally {
        setSending(false);
      }
    },
    [chatId, currentUserId, currentUserName, thread, onSendComplete, syncDev],
  );

  return { send, sendImage, sending };
}
