import { useCallback, useState } from 'react';
import {
  sendMessage,
  uploadChatImage,
  type SendMessageThreadContext,
} from '../chatService';
import { firestoreReady } from '../firebase';
import type { ChatSendMessageFn } from '../types';

/**
 * Chat send/upload hook. Uses REST when sendViaApi is provided; otherwise writes to Firestore.
 */
export function useFirestoreChatMessaging(
  chatId: string | null,
  currentUserId: string,
  currentUserName: string,
  thread: SendMessageThreadContext | null | undefined,
  options?: {
    onSendComplete?: () => void | Promise<void>;
    sendViaApi?: ChatSendMessageFn;
  },
): {
  sending: boolean;
  send: (text: string) => Promise<void>;
  sendImage: (localUri: string, caption?: string) => Promise<void>;
} {
  const [sending, setSending] = useState(false);
  const onSendComplete = options?.onSendComplete;
  const sendViaApi = options?.sendViaApi;

  const send = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;
      setSending(true);
      try {
        if (sendViaApi) {
          await sendViaApi({ chatId, text: text.trim() });
          await onSendComplete?.();
          return;
        }

        if (!firestoreReady) {
          console.warn('[chat-sdk] send skipped because Firestore chat is not enabled.');
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
    [chatId, currentUserId, currentUserName, thread, onSendComplete, sendViaApi],
  );

  const sendImage = useCallback(
    async (localUri: string, caption = '') => {
      if (!chatId) return;
      setSending(true);
      try {
        if (sendViaApi) {
          const url = await uploadChatImage(chatId, localUri);
          await sendViaApi({ chatId, text: caption, imageUrl: url });
          await onSendComplete?.();
          return;
        }

        if (!firestoreReady) {
          console.warn('[chat-sdk] image send skipped because Firestore chat is not enabled.');
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
    [chatId, currentUserId, currentUserName, thread, onSendComplete, sendViaApi],
  );

  return { send, sendImage, sending };
}
