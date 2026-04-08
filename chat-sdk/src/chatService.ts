import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { db, firestoreReady } from './firebase';
import type {
  Chat,
  ChatBookingMeta,
  ChatDoc,
  ChatParticipantRole,
  ChatThreadType,
  Message,
  MessageDoc,
} from './types';

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

/** Optional thread metadata from the host app (e.g. Postgres connection / booking APIs). */
export type SendMessageThreadContext = {
  bookingId?: number;
  threadType?: ChatThreadType;
  participantIds: string[];
  participantNames?: Record<string, string>;
  participantRoles?: Record<string, ChatParticipantRole>;
  bookingMeta?: ChatBookingMeta;
};

function normalizeParticipantId(id: string | number): string {
  return String(id).trim();
}

function buildBookingThreadId(
  bookingId: number,
  participantA: string | number,
  participantB: string | number,
): string {
  const normalized = uniqueParticipantIds([participantA, participantB]).sort();
  if (normalized.length !== 2) {
    throw new Error('[chat-sdk] buildBookingThreadId requires exactly two participants.');
  }
  return `booking_${bookingId}_${normalized[0]}_${normalized[1]}`;
}

/**
 * Canonical Firestore thread id for booking-scoped participant pairs.
 */
export function getUserPartnerChatId(
  bookingId: number,
  appUserId: string,
  partnerId: string,
): string {
  return buildBookingThreadId(
    bookingId,
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
  const participantRoles =
    safe.participantRoles && typeof safe.participantRoles === 'object'
      ? safe.participantRoles
      : {};
  return {
    chatId: id,
    bookingId: typeof safe.bookingId === 'number' ? safe.bookingId : 0,
    threadType: safe.threadType ?? 'user-partner',
    participantIds,
    participantNames,
    participantRoles,
    lastMessage: typeof safe.lastMessage === 'string' ? safe.lastMessage : '',
    lastMessageAt: safe.lastMessageAt?.toDate() ?? new Date(),
    unreadCount:
      safe.unreadCount && typeof safe.unreadCount === 'object'
        ? safe.unreadCount
        : {},
    createdAt: safe.createdAt?.toDate() ?? new Date(),
    bookingMeta:
      safe.bookingMeta && typeof safe.bookingMeta === 'object'
        ? safe.bookingMeta
        : {},
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
 * Creates a booking-scoped chat thread if one doesn't exist, otherwise returns
 * the existing deterministic chat id.
 */
export async function createOrGetChat(args: {
  bookingId: number;
  currentUserId: string;
  otherParticipantId: string;
  threadType: ChatThreadType;
  participantNames: Record<string, string>;
  participantRoles: Record<string, ChatParticipantRole>;
  bookingMeta?: ChatBookingMeta;
}): Promise<string> {
  const bookingId = Number(args.bookingId);
  const currentUserId = normalizeParticipantId(args.currentUserId);
  const otherParticipantId = normalizeParticipantId(args.otherParticipantId);
  const participantIds = uniqueParticipantIds([currentUserId, otherParticipantId]).sort();
  const chatId = buildBookingThreadId(bookingId, currentUserId, otherParticipantId);

  if (!ensureDb()) {
    console.warn('[chat-sdk] createOrGetChat: Firestore not ready.');
    return chatId;
  }

  try {
    const chatRef = db!.collection(CHATS).doc(chatId);
    const snap = await chatRef.get();

    if (snap.exists) return chatId;

    const now = firestore.FieldValue.serverTimestamp();
    await chatRef.set({
      bookingId,
      threadType: args.threadType,
      participantIds,
      participantNames: args.participantNames,
      participantRoles: args.participantRoles,
      lastMessage: '',
      lastMessageAt: now,
      unreadCount: Object.fromEntries(participantIds.map((id) => [id, 0])),
      createdAt: now,
      bookingMeta: args.bookingMeta ?? {},
    });

    return chatId;
  } catch (error) {
    console.warn('[chat-sdk] createOrGetChat: Firestore error:', error);
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
    const mergedRoles: Record<string, ChatParticipantRole> = {
      ...(data?.participantRoles ?? {}),
      ...(thread?.participantRoles ?? {}),
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
      patch.participantRoles = mergedRoles;
      patch.threadType = thread?.threadType ?? 'user-partner';
      patch.bookingId = thread?.bookingId ?? 0;
      patch.bookingMeta = thread?.bookingMeta ?? {};
    }

    // Always merge-set the parent doc: `update()` throws NOT_FOUND if the doc was deleted,
    // missing, or the client cache was wrong; merge-set matches create-or-patch semantics.
    const parentPayload: Record<string, unknown> = { ...patch };
    if (!chatSnap.exists) {
      parentPayload.createdAt = firestore.FieldValue.serverTimestamp();
      if (!parentPayload.participantIds && effectiveIds.length > 0) {
        parentPayload.participantIds = effectiveIds;
        parentPayload.participantNames = mergedNames;
        parentPayload.participantRoles = mergedRoles;
        parentPayload.threadType = thread?.threadType ?? 'user-partner';
        parentPayload.bookingId = thread?.bookingId ?? 0;
        parentPayload.bookingMeta = thread?.bookingMeta ?? {};
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
              console.warn('[chat-sdk] subscribeToMessages: permission denied.');
            } else {
              // eslint-disable-next-line no-console
              console.error('[chat-sdk] subscribeToMessages error:', error);
            }
            callback([]);
          },
        );
    } catch (error) {
      console.error('[chat-sdk] subscribeToMessages setup error:', error);
      if (!cancelled) {
        callback([]);
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
   * When rules deny reads, invoked instead of `callback([])` so the host app can
   * handle the empty/blocked state explicitly.
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
