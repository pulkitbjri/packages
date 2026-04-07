import type { Message } from './types';

export type ChatMessagesApiNameContext = {
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
};

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const v = obj[key];
    if (v === null || v === undefined) continue;
    const s = String(v).trim();
    if (s.length > 0) return s;
  }
  return null;
}

function parseCreatedAt(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

/**
 * Maps one API / Firestore-exported message row to {@link Message}.
 * Text: text | message | body | content. Sender: senderId | fromUserId | from | sender | uid | userId.
 */
export function mapApiRowToMessage(
  row: unknown,
  ctx: ChatMessagesApiNameContext,
): Message {
  const o = row && typeof row === 'object' ? (row as Record<string, unknown>) : {};
  const id =
    pickString(o, ['id', 'messageId', '_id']) ?? `api_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const text =
    pickString(o, ['text', 'message', 'body', 'content']) ?? '';
  const senderId =
    pickString(o, ['senderId', 'fromUserId', 'from', 'sender', 'uid', 'userId']) ?? '';
  const createdAt = parseCreatedAt(o.createdAt ?? o.timestamp ?? o.time);
  const self = String(ctx.currentUserId ?? '').trim();
  const sid = String(senderId).trim();
  const isSelf = sid.length > 0 && sid === self;
  const senderName = isSelf
    ? (ctx.currentUserName || 'You').trim()
    : (ctx.otherPartyName || 'Customer').trim() || 'Customer';

  return {
    messageId: id,
    senderId: sid,
    senderName: senderName || '…',
    text,
    createdAt,
    readBy: [],
  };
}

export type ParsedChatMessagesPage = {
  messages: Message[];
  nextCursor: string | null;
};

/**
 * Parses GET /chat/{chatId}/messages JSON body.
 */
export function parseChatMessagesApiResponse(
  data: unknown,
  ctx: ChatMessagesApiNameContext,
): ParsedChatMessagesPage {
  if (!data || typeof data !== 'object') {
    return { messages: [], nextCursor: null };
  }
  const r = data as Record<string, unknown>;
  const rawList = Array.isArray(r.messages) ? r.messages : [];
  const messages = rawList.map((row) => mapApiRowToMessage(row, ctx));
  const next = r.nextCursor;
  const nextCursor =
    typeof next === 'string' && next.trim().length > 0 ? next.trim() : null;
  return { messages, nextCursor };
}
