import { useCallback, useState } from 'react';
import type { ChatMediaUploadFn, ChatSendMessageFn } from '../types';

export function useBackendChatMessaging(
  chatId: string | null,
  options?: {
    onSendComplete?: () => void | Promise<void>;
    sendViaApi?: ChatSendMessageFn;
    uploadMedia?: ChatMediaUploadFn;
  },
): {
  sending: boolean;
  send: (text: string) => Promise<void>;
  sendImage: (localUri: string, caption?: string) => Promise<void>;
} {
  const [sending, setSending] = useState(false);
  const onSendComplete = options?.onSendComplete;
  const sendViaApi = options?.sendViaApi;
  const uploadMedia = options?.uploadMedia;

  const send = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;
      if (!sendViaApi) {
        console.warn('[chat-sdk] send skipped because backend send function is missing.');
        return;
      }
      setSending(true);
      try {
        await sendViaApi({ chatId, text: text.trim() });
        await onSendComplete?.();
      } finally {
        setSending(false);
      }
    },
    [chatId, onSendComplete, sendViaApi],
  );

  const sendImage = useCallback(
    async (localUri: string, caption = '') => {
      if (!chatId) return;
      if (!sendViaApi || !uploadMedia) {
        console.warn('[chat-sdk] image send skipped because backend media/send functions are missing.');
        return;
      }
      setSending(true);
      try {
        const uploaded = await uploadMedia({ chatId, localUri });
        await sendViaApi({
          chatId,
          text: caption,
          imageUrl: uploaded.imageUrl,
          mediaObjectPath: uploaded.objectPath,
          mediaContentType: uploaded.contentType,
        });
        await onSendComplete?.();
      } finally {
        setSending(false);
      }
    },
    [chatId, onSendComplete, sendViaApi, uploadMedia],
  );

  return { send, sendImage, sending };
}
