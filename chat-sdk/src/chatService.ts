import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { db, firestoreReady } from './firebase';
import type { Chat, ChatDoc, Message, MessageDoc } from './types';

const CHATS = 'chats';
const MESSAGES = 'messages';

/** Detect Firestore security rule rejections (React Native Firebase error shape). */
export function isFirestorePermissionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const rec = error as { code?: string; message?: string };
  const code = typeof rec.code === 'string' ? rec.code : '';
  const msg = typeof rec.message === 'string' ? rec.message : '';
  return (
    code.includes('permission-denied') || msg.includes('permission-denied')
  );
}

/** Firebase Storage rule/auth failures (not the same as Firestore permission-denied). */
export function isStoragePermissionError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const rec = error as { code?: string; message?: string };
  const code = typeof rec.code === 'string' ? rec.code : '';
  const msg = typeof rec.message === 'string' ? rec.message : '';
  return (
    code.includes('storage/unauthorized') ||
    code.includes('storage/unauthenticated') ||
    (code.startsWith('storage/') && msg.toLowerCase().includes('permission'))
  );
}

/** Detect Firestore missing-index errors and fallback to simpler queries. */
function isFirestoreMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const rec = error as { code?: string; message?: string };
  const code = typeof rec.code === 'string' ? rec.code : '';
  const msg = typeof rec.message === 'string' ? rec.message : '';
  return code.includes('failed-precondition') || msg.includes('requires an index');
}

function ensureDb(): boolean {
  // firestoreReady is computed in firebase.ts; db is null when Firestore can't initialize.
  if (!firestoreReady || !db) {
    // eslint-disable-next-line no-console
    console.warn('[chat-sdk] Firestore not ready; chat operations are no-ops.');
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function buildChatId(userId: string, partnerId: string): string {
  return `user_${userId}_partner_${partnerId}`;
}

/** Optional thread metadata from the host app (e.g. Postgres connection / booking APIs). */
export type SendMessageThreadContext = {
  participantIds: string[];
  participantNames?: Record<string, string>;
};

function normalizeParticipantId(id: string | number): string {
  return String(id).trim();
}

/**
 * Canonical Firestore thread id for app user ↔ partner (same as {@link createOrGetChat}).
 * Use when the backend returns `connectionId` / UUID but messages live under
 * `user_<userId>_partner_<partnerId>`.
 */
export function getUserPartnerChatId(appUserId: string, partnerId: string): string {
  return buildChatId(
    normalizeParticipantId(appUserId),
    normalizeParticipantId(partnerId),
  );
}

function uniqueParticipantIds(ids: (string | number)[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    const s = normalizeParticipantId(raw);
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function toChatModel(id: string, doc: ChatDoc | undefined): Chat {
  const safe = doc ?? ({} as Partial<ChatDoc>);
  const participantIds = Array.isArray(safe.participantIds)
    ? safe.participantIds
    : [];
  const participantNames =
    safe.participantNames && typeof safe.participantNames === 'object'
      ? safe.participantNames
      : {};
  return {
    chatId: id,
    type: safe.type ?? 'user-partner',
    userId: safe.userId ?? '',
    partnerId: safe.partnerId ?? '',
    participantIds,
    participantNames,
    lastMessage: typeof safe.lastMessage === 'string' ? safe.lastMessage : '',
    lastMessageAt: safe.lastMessageAt?.toDate() ?? new Date(),
    unreadCount:
      safe.unreadCount && typeof safe.unreadCount === 'object'
        ? safe.unreadCount
        : {},
    createdAt: safe.createdAt?.toDate() ?? new Date(),
  };
}

function toMessageModel(id: string, doc: MessageDoc | undefined): Message {
  const safe = doc ?? ({} as Partial<MessageDoc>);
  return {
    messageId: id,
    senderId: safe.senderId ?? '',
    senderName: safe.senderName ?? '',
    text: typeof safe.text === 'string' ? safe.text : '',
    imageUrl: safe.imageUrl,
    createdAt: safe.createdAt?.toDate() ?? new Date(),
    readBy: Array.isArray(safe.readBy) ? safe.readBy : [],
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new chat thread if one doesn't exist for the (userId, partnerId)
 * pair, otherwise returns the existing chatId.
 */
export async function createOrGetChat(
  userId: string,
  partnerId: string,
  names: Record<string, string>,
): Promise<string> {
  const chatId = buildChatId(userId, partnerId);
  
  if (!ensureDb()) {
    console.warn('[chat-sdk] createOrGetChat: Firestore not ready, returning chatId for demo mode');
    return chatId;
  }
  
  try {
    const chatRef = db!.collection(CHATS).doc(chatId);
    const snap = await chatRef.get();

    if (snap.exists) return chatId;

    const now = firestore.FieldValue.serverTimestamp();
    await chatRef.set({
      type: 'user-partner',
      userId,
      partnerId,
      participantIds: [userId, partnerId],
      participantNames: names,
      lastMessage: '',
      lastMessageAt: now,
      unreadCount: { [userId]: 0, [partnerId]: 0 },
      createdAt: now,
    });

    return chatId;
  } catch (error) {
    console.warn('[chat-sdk] createOrGetChat: Firestore error, returning chatId for demo mode:', error);
    return chatId;
  }
}

/**
 * Sends a text message in an existing chat thread.
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  text: string,
  imageUrl?: string,
  thread?: SendMessageThreadContext,
): Promise<void> {
  if (!ensureDb()) {
    console.warn('[chat-sdk] sendMessage: Firestore not ready, message not sent');
    return;
  }
  
  try {
    const chatRef = db!.collection(CHATS).doc(chatId);
    const msgRef = chatRef.collection(MESSAGES).doc();

    const batch = db!.batch();

    batch.set(msgRef, {
      senderId,
      senderName,
      text,
      ...(imageUrl ? { imageUrl } : {}),
      createdAt: firestore.FieldValue.serverTimestamp(),
      readBy: [senderId],
    });

    const chatSnap = await chatRef.get();
    const lastMessageText = text || (imageUrl ? '📷 Photo' : '');
    const lastMessageFields = {
      lastMessage: lastMessageText,
      lastMessageAt: firestore.FieldValue.serverTimestamp(),
    };

    const data = chatSnap.exists ? (chatSnap.data() as ChatDoc | undefined) : undefined;

    const rawParticipantIds = data && Array.isArray(data.participantIds) ? data.participantIds : [];
    const docParticipantIds = uniqueParticipantIds(rawParticipantIds);

    const threadParticipantIds = Array.isArray(thread?.participantIds)
      ? uniqueParticipantIds(thread.participantIds)
      : [];

    const effectiveIds =
      docParticipantIds.length > 0
        ? docParticipantIds
        : threadParticipantIds.length > 0
          ? uniqueParticipantIds([...threadParticipantIds, senderId])
          : [];

    const threadNames =
      thread?.participantNames &&
      typeof thread.participantNames === 'object' &&
      !Array.isArray(thread.participantNames)
        ? (thread.participantNames as Record<string, string>)
        : {};
    const mergedNames: Record<string, string> = {
      ...(data?.participantNames ?? {}),
      ...threadNames,
    };
    if (senderName) {
      mergedNames[senderId] = senderName;
    }

    const patch: Record<string, unknown> = { ...lastMessageFields };

    if (effectiveIds.length > 0) {
      for (const pid of effectiveIds) {
        patch[`unreadCount.${pid}`] =
          pid === senderId ? 0 : (data?.unreadCount?.[pid] ?? 0) + 1;
      }
    }

    if (docParticipantIds.length === 0 && threadParticipantIds.length > 0) {
      patch.participantIds = uniqueParticipantIds([...threadParticipantIds, senderId]);
      patch.participantNames = mergedNames;
      patch.type = 'user-partner';
    }

    // Always merge-set the parent doc: `update()` throws NOT_FOUND if the doc was deleted,
    // missing, or the client cache was wrong; merge-set matches create-or-patch semantics.
    const parentPayload: Record<string, unknown> = { ...patch };
    if (!chatSnap.exists) {
      parentPayload.createdAt = firestore.FieldValue.serverTimestamp();
      if (!parentPayload.participantIds && effectiveIds.length > 0) {
        parentPayload.participantIds = effectiveIds;
        parentPayload.participantNames = mergedNames;
        parentPayload.type = 'user-partner';
      }
    }
    batch.set(chatRef, parentPayload, { merge: true });

    await batch.commit();
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      // Avoid redbox from unhandled promise rejection when console rules block writes.
      console.warn(
        '[chat-sdk] sendMessage: permission denied. Publish firestore.rules for app-auth based access.',
      );
      return;
    }
    console.error('[chat-sdk] sendMessage: Failed to send message:', error);
    throw error; // Keep non-permission failures visible to the UI
  }
}

/**
 * Real-time listener for messages in a chat, ordered newest-last.
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void,
  limit = 50,
): () => void {
  if (!ensureDb()) return () => {};

  let detach: (() => void) | undefined;
  let cancelled = false;

  void (async () => {
    try {
      detach = db
        .collection(CHATS)
        .doc(chatId)
        .collection(MESSAGES)
        .orderBy('createdAt', 'asc')
        .limitToLast(limit)
        .onSnapshot(
          (snapshot) => {
            const msgs = snapshot.docs.map((d) =>
              toMessageModel(d.id, d.data() as MessageDoc | undefined),
            );
            callback(msgs);
          },
          (error) => {
            if (isFirestorePermissionError(error)) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn(
                  '[chat-sdk] subscribeToMessages: permission denied; showing demo thread.',
                );
              }
            } else {
              // eslint-disable-next-line no-console
              console.error('[chat-sdk] subscribeToMessages error:', error);
            }
            const demoMessages: Message[] = getDemoMessagesForChat(chatId);
            callback(demoMessages);
          },
        );
    } catch (error) {
      console.error('[chat-sdk] subscribeToMessages setup error:', error);
      if (!cancelled) {
        callback(getDemoMessagesForChat(chatId));
      }
    }
  })();

  return () => {
    cancelled = true;
    detach?.();
  };
}

/**
 * Real-time listener for all chat threads a participant belongs to.
 * Returns an unsubscribe function.
 */
export type FirestoreListenOptions = {
  /**
   * When rules deny reads, invoked instead of `callback([])` so the UI can show demo data.
   */
  onPermissionDenied?: () => void;
};

export function subscribeToChats(
  participantId: string,
  callback: (chats: Chat[]) => void,
  options?: FirestoreListenOptions,
): () => void {
  if (!ensureDb()) return () => {};

  let detach: (() => void) | undefined;
  let fallbackDetach: (() => void) | undefined;
  let usingFallback = false;
  let cancelled = false;

  const subscribeWithoutOrderBy = () => {
    if (usingFallback) return;
    usingFallback = true;
    detach?.();
    fallbackDetach = db
      .collection(CHATS)
      .where('participantIds', 'array-contains', participantId)
      .onSnapshot(
        (snapshot) => {
          const chats = snapshot.docs
            .map((d) => toChatModel(d.id, d.data() as ChatDoc | undefined))
            .sort(
              (a, b) =>
                b.lastMessageAt.getTime() - a.lastMessageAt.getTime(),
            );
          callback(chats);
        },
        (error) => {
          if (isFirestorePermissionError(error)) {
            if (options?.onPermissionDenied) {
              options.onPermissionDenied();
              return;
            }
            callback([]);
            return;
          }
          // eslint-disable-next-line no-console
          console.error('[chat-sdk] subscribeToChats fallback error:', error);
          callback([]);
        },
      );
  };

  void (async () => {
    try {
      detach = db
        .collection(CHATS)
        .where('participantIds', 'array-contains', participantId)
        .orderBy('lastMessageAt', 'desc')
        .onSnapshot(
          (snapshot) => {
            const chats = snapshot.docs.map((d) =>
              toChatModel(d.id, d.data() as ChatDoc | undefined),
            );
            callback(chats);
          },
          (error) => {
            if (isFirestorePermissionError(error)) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn(
                  '[chat-sdk] subscribeToChats: permission denied. Deploy `firestore.rules` (see FIRESTORE_SETUP.md) or set USE_LIVE_FIRESTORE_CHAT=false in chat-sdk/src/firebase.ts.',
                );
              }
              if (options?.onPermissionDenied) {
                options.onPermissionDenied();
                return;
              }
              callback([]);
              return;
            }
            if (isFirestoreMissingIndexError(error)) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn(
                  '[chat-sdk] subscribeToChats: missing composite index, falling back to unordered query + client-side sort.',
                );
              }
              subscribeWithoutOrderBy();
              return;
            }
            // eslint-disable-next-line no-console
            console.error('[chat-sdk] subscribeToChats error:', error);
            callback([]);
          },
        );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[chat-sdk] subscribeToChats setup error:', error);
      if (!cancelled) callback([]);
    }
  })();

  return () => {
    cancelled = true;
    detach?.();
    fallbackDetach?.();
  };
}

/**
 * Resets the unread counter for a specific user in a chat.
 */
export async function markMessagesRead(
  chatId: string,
  userId: string,
): Promise<void> {
  if (!ensureDb()) return;
  try {
    await db!
      .collection(CHATS)
      .doc(chatId)
      .set({ [`unreadCount.${userId}`]: 0 }, { merge: true });
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      console.warn(
        '[chat-sdk] markMessagesRead: permission denied. Publish firestore.rules for app-auth based access.',
      );
      return;
    }
    throw error;
  }
}

/**
 * Uploads a local image to Firebase Storage and returns the download URL.
 * Objects live under `chat_images/{chatId}/` where `chatId` is the same thread id
 * as Firestore `chats/{chatId}` (e.g. backend `connectionId`).
 */
export async function uploadChatImage(
  chatId: string,
  localUri: string,
): Promise<string> {
  if (!ensureDb()) return '';
  try {
    const filename = `chat_images/${chatId}/${Date.now()}.jpg`;
    const ref = storage().ref(filename);
    await ref.putFile(localUri);
    return ref.getDownloadURL();
  } catch (error) {
    if (isStoragePermissionError(error)) {
      console.warn(
        '[chat-sdk] uploadChatImage: Storage blocked by rules or auth. Publish storage.rules so the logged-in user can write `chat_images/{chatId}/**`.',
      );
      return '';
    }
    throw error;
  }
}

/**
 * Loads older messages before the earliest currently loaded message.
 */
export async function loadEarlierMessages(
  chatId: string,
  beforeDate: Date,
  limit = 20,
): Promise<Message[]> {
  if (!ensureDb()) return [];
  try {
    const snapshot = await db!
      .collection(CHATS)
      .doc(chatId)
      .collection(MESSAGES)
      .orderBy('createdAt', 'desc')
      .startAfter(firestore.Timestamp.fromDate(beforeDate))
      .limit(limit)
      .get();

    return snapshot.docs
      .map((d) => toMessageModel(d.id, d.data() as MessageDoc | undefined))
      .reverse();
  } catch (error) {
    if (isFirestorePermissionError(error)) {
      console.warn(
        '[chat-sdk] loadEarlierMessages: permission denied. Publish firestore.rules for app-auth based access.',
      );
      return [];
    }
    throw error;
  }
}

/**
 * Returns total unread message count across all chats for a participant.
 * Useful for tab badges.
 */
export function subscribeToTotalUnread(
  participantId: string,
  callback: (count: number) => void,
  options?: FirestoreListenOptions,
): () => void {
  if (!ensureDb()) return () => {};

  let detach: (() => void) | undefined;
  let cancelled = false;

  void (async () => {
    try {
      detach = db
        .collection(CHATS)
        .where('participantIds', 'array-contains', participantId)
        .onSnapshot(
          (snapshot) => {
            let total = 0;
            for (const doc of snapshot.docs) {
              const data = doc.data() as ChatDoc | undefined;
              total += data?.unreadCount?.[participantId] ?? 0;
            }
            callback(total);
          },
          (error) => {
            if (isFirestorePermissionError(error)) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn(
                  '[chat-sdk] subscribeToTotalUnread: permission denied (same fix as chat list).',
                );
              }
              if (options?.onPermissionDenied) {
                options.onPermissionDenied();
                return;
              }
              callback(0);
              return;
            }
            // eslint-disable-next-line no-console
            console.error('[chat-sdk] subscribeToTotalUnread error:', error);
            callback(0);
          },
        );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[chat-sdk] subscribeToTotalUnread setup error:', error);
      if (!cancelled) callback(0);
    }
  })();

  return () => {
    cancelled = true;
    detach?.();
  };
}
