import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { ChatListScreenProps, Chat, ChatTheme } from '../types';
import { useChatList } from '../hooks/useChatList';
import { resolveTheme } from './defaultTheme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getOtherPartyName(
  chat: Chat,
  currentUserId: string,
): string {
  const names = chat.participantNames ?? {};
  for (const [id, name] of Object.entries(names)) {
    if (id !== currentUserId) {
      const label =
        typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
      if (label) return label;
    }
  }
  return 'Unknown';
}

function getOtherPartyRole(chat: Chat, currentUserId: string): string {
  for (const [id, role] of Object.entries(chat.participantRoles ?? {})) {
    if (id !== currentUserId) {
      return role?.toUpperCase?.() ?? 'CHAT';
    }
  }
  return 'CHAT';
}

function getBookingContext(chat: Chat): string {
  const parts = [
    chat.bookingMeta?.eventName,
    chat.bookingMeta?.eventDate,
    chat.bookingMeta?.status,
  ].filter(Boolean);
  return parts.join(' · ') || `Booking #${chat.bookingId}`;
}

// ---------------------------------------------------------------------------
// Chat Row
// ---------------------------------------------------------------------------

interface ChatRowProps {
  chat: Chat;
  currentUserId: string;
  onPress: () => void;
  theme: ChatTheme;
}

const ChatRow: React.FC<ChatRowProps> = ({ chat, currentUserId, onPress, theme }) => {
  const otherName = getOtherPartyName(chat, currentUserId);
  const otherRole = getOtherPartyRole(chat, currentUserId);
  const bookingContext = getBookingContext(chat);
  const unread = chat.unreadCount?.[currentUserId] ?? 0;

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.65}>
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Text style={styles.avatarText}>
          {(otherName || '?').charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <View style={styles.nameGroup}>
            <Text
              style={[
                styles.name,
                { color: theme.text },
                unread > 0 && styles.nameBold,
              ]}
              numberOfLines={1}>
              {otherName}
            </Text>
            <View style={[styles.rolePill, { backgroundColor: theme.receivedBubble }]}>
              <Text style={[styles.rolePillText, { color: theme.primary }]}>{otherRole}</Text>
            </View>
          </View>
          <Text style={[styles.time, { color: theme.timestamp }]}>
            {formatRelativeTime(chat.lastMessageAt)}
          </Text>
        </View>
        <Text style={[styles.bookingContext, { color: theme.timestamp }]} numberOfLines={1}>
          {bookingContext}
        </Text>
        <View style={styles.rowBottom}>
          <Text
            style={[
              styles.lastMessage,
              { color: theme.textSecondary },
              unread > 0 && { color: theme.text, fontWeight: '500' },
            ]}
            numberOfLines={1}>
            {chat.lastMessage || 'No messages yet'}
          </Text>
          {unread > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ---------------------------------------------------------------------------
// ChatListScreen
// ---------------------------------------------------------------------------

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  currentUserId,
  currentUserRole,
  onChatPress,
  theme: themeOverride,
}) => {
  const theme = resolveTheme(themeOverride);
  const { chats, loading } = useChatList(currentUserId);

  const renderItem = useCallback(
    ({ item }: { item: Chat }) => {
      const otherName = getOtherPartyName(item, currentUserId);
      return (
        <ChatRow
          chat={item}
          currentUserId={currentUserId}
          onPress={() => onChatPress(item, otherName)}
          theme={theme}
        />
      );
    },
    [currentUserId, onChatPress, theme],
  );

  const keyExtractor = useCallback((item: Chat) => item.chatId, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyIcon]}>💬</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No conversations yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {currentUserRole === 'user'
              ? 'Browse partners and send a message to start chatting.'
              : 'Clients will reach out when they need your services.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  nameBold: {
    fontWeight: '700',
  },
  rolePill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
  },
  bookingContext: {
    fontSize: 12,
    marginBottom: 4,
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
