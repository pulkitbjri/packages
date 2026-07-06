import type { Chat, Message } from './types';

export type SendMessageThreadContext = {
  bookingId?: number;
  threadType?: string;
  participantIds: string[];
  participantNames?: Record<string, string>;
  participantRoles?: Record<string, string>;
  bookingMeta?: Record<string, unknown>;
};

export type ChatListenOptions = {
  onPermissionDenied?: () => void;
};

export function isChatStoragePermissionError(): boolean {
  return false;
}

export function isStoragePermissionError(): boolean {
  return false;
}

export function getUserPartnerChatId(
  bookingId: number,
  appUserId: string,
  partnerId: string,
): string {
  const pair = [String(appUserId), String(partnerId)].sort();
  return `booking_${bookingId}_${pair[0]}_${pair[1]}`;
}

function missingBackendImplementation(name: string): never {
  throw new Error(`[chat-sdk] ${name} requires backend REST/WebSocket functions.`);
}

export async function createOrGetChat(): Promise<string> {
  missingBackendImplementation('createOrGetChat');
}

export async function sendMessage(): Promise<void> {
  missingBackendImplementation('sendMessage');
}

export function subscribeToMessages(
  _chatId: string,
  _callback: (messages: Message[]) => void,
): () => void {
  return () => {};
}

export function subscribeToChats(
  _participantId: string,
  _callback: (chats: Chat[]) => void,
): () => void {
  return () => {};
}

export async function markMessagesRead(): Promise<void> {
  missingBackendImplementation('markMessagesRead');
}

export async function uploadChatImage(): Promise<string> {
  missingBackendImplementation('uploadChatImage');
}

export async function loadEarlierMessages(): Promise<Message[]> {
  missingBackendImplementation('loadEarlierMessages');
}

export function subscribeToTotalUnread(
  _participantId: string,
  _callback: (count: number) => void,
): () => void {
  return () => {};
}
