import type { ChatTheme } from '../types';

export const DEFAULT_CHAT_THEME: ChatTheme = {
  primary: '#D8A48F',
  background: '#FAF9F6',
  surface: '#FFFFFF',
  text: '#2A2A2A',
  textSecondary: '#4A4A4A',
  border: '#E5E7EB',
  accent: '#B08472',
  sentBubble: '#D8A48F',
  sentBubbleText: '#FFFFFF',
  receivedBubble: '#F1F5F9',
  receivedBubbleText: '#2A2A2A',
  inputBackground: '#FFFFFF',
  timestamp: '#A0A0A0',
};

export const PARTNER_CHAT_THEME: ChatTheme = {
  primary: '#4338CA',
  background: '#F9FAFF',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  accent: '#6366F1',
  sentBubble: '#4338CA',
  sentBubbleText: '#FFFFFF',
  receivedBubble: '#EEF2FF',
  receivedBubbleText: '#111827',
  inputBackground: '#FFFFFF',
  timestamp: '#94A3B8',
};

/** User app — Festive Sharp (wine accents / sindoor sent bubbles). */
export const USER_FESTIVE_CHAT_THEME: ChatTheme = {
  primary: '#8B1A2B',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#D4564E',
  sentBubble: '#D4564E',
  sentBubbleText: '#FFFFFF',
  receivedBubble: '#F3F4F6',
  receivedBubbleText: '#1F2937',
  inputBackground: '#FFFFFF',
  timestamp: '#9CA3AF',
};

export function resolveTheme(partial?: Partial<ChatTheme>): ChatTheme {
  return { ...DEFAULT_CHAT_THEME, ...partial };
}
