import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import type {
  ChatListScreenProps,
  Chat,
  ChatTheme,
  ChatParticipantRole,
} from '../types';
import { resolveTheme } from './defaultTheme';

type RoleFilter = 'all' | 'partner' | 'cm' | 'user';

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
  unknownLabel: string,
): string {
  const names = chat.participantNames ?? {};
  for (const [id, name] of Object.entries(names)) {
    if (id !== currentUserId) {
      const label =
        typeof name === 'string' && name.trim().length > 0 ? name.trim() : null;
      if (label) return label;
    }
  }
  return unknownLabel;
}

function getOtherPartyRole(
  chat: Chat,
  currentUserId: string,
): ChatParticipantRole | null {
  for (const [id, role] of Object.entries(chat.participantRoles ?? {})) {
    if (id !== currentUserId && role) {
      return role;
    }
  }
  return null;
}

function rolePillLabel(
  role: ChatParticipantRole | null,
  t: (key: string) => string,
): string {
  if (role === 'cm') return t('cityManager');
  if (role === 'partner') return t('partner');
  if (role === 'user') return t('client');
  return t('chat');
}

function getBookingContext(chat: Chat): string {
  const parts = [
    chat.bookingMeta?.eventName,
    chat.bookingMeta?.eventDate,
    chat.bookingMeta?.status,
  ].filter(Boolean);
  return parts.join(' · ') || `Booking #${chat.bookingId}`;
}

function matchesRoleFilter(
  chat: Chat,
  filter: RoleFilter,
  currentUserId: string,
): boolean {
  if (filter === 'all') return true;
  const role = getOtherPartyRole(chat, currentUserId);
  return role === filter;
}

function matchesSearchQuery(
  chat: Chat,
  query: string,
  currentUserId: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const name = getOtherPartyName(chat, currentUserId).toLowerCase();
  const booking = getBookingContext(chat).toLowerCase();
  const last = (chat.lastMessage ?? '').toLowerCase();
  return name.includes(q) || booking.includes(q) || last.includes(q);
}

interface ChatRowProps {
  chat: Chat;
  currentUserId: string;
  onPress: () => void;
  theme: ChatTheme;
}

const ChatRow: React.FC<ChatRowProps> = ({ chat, currentUserId, onPress, theme }) => {
  const { t } = useTranslation('chat');
  const otherName = getOtherPartyName(chat, currentUserId, t('unknown'));
  const otherRole = getOtherPartyRole(chat, currentUserId);
  const bookingContext = getBookingContext(chat);
  const unread = chat.unreadCount?.[currentUserId] ?? 0;
  const badgeColor = theme.accent || theme.primary;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
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
              <Text style={[styles.rolePillText, { color: theme.primary }]}>
                {rolePillLabel(otherRole, t)}
              </Text>
            </View>
          </View>
          <Text style={[styles.time, { color: theme.timestamp }]}>
            {formatRelativeTime(chat.lastMessageAt)}
          </Text>
        </View>
        <Text style={[styles.bookingContext, { color: theme.textSecondary }]} numberOfLines={1}>
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
            {chat.lastMessage || t('noMessagesPreview')}
          </Text>
          {unread > 0 ? (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SkeletonRow: React.FC<{ theme: ChatTheme }> = ({ theme }) => (
  <View
    style={[
      styles.card,
      styles.skeletonCard,
      { backgroundColor: theme.surface, borderColor: theme.border },
    ]}>
    <View style={[styles.skeletonAvatar, { backgroundColor: theme.border }]} />
    <View style={styles.skeletonBody}>
      <View style={[styles.skeletonLine, styles.skeletonLineShort, { backgroundColor: theme.border }]} />
      <View style={[styles.skeletonLine, { backgroundColor: theme.border }]} />
      <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: theme.border }]} />
    </View>
  </View>
);

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ChatTheme;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, active, onPress, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      {
        borderColor: theme.primary,
        backgroundColor: active ? theme.primary : theme.surface,
      },
    ]}
    activeOpacity={0.7}>
    <Text
      style={[
        styles.chipText,
        { color: active ? '#FFFFFF' : theme.primary },
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  currentUserId,
  currentUserRole,
  onChatPress,
  loadChatsViaApi,
  theme: themeOverride,
}) => {
  const { t } = useTranslation('chat');
  const theme = resolveTheme(themeOverride);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const fetchList = loadChatsViaApi?.fetchList;
  const subscribeToEvents = loadChatsViaApi?.subscribeToEvents;
  const pollMs = loadChatsViaApi?.pollIntervalMs ?? 10_000;

  const refresh = useCallback(async () => {
    if (!fetchList) {
      setChats([]);
      setLoading(false);
      return;
    }
    try {
      const result = await fetchList();
      setChats(result.chats);
    } catch {
      // leave prior list
    } finally {
      setLoading(false);
    }
  }, [fetchList]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!fetchList || pollMs <= 0) return;
    const timer = setInterval(() => {
      void refresh();
    }, pollMs);
    return () => clearInterval(timer);
  }, [fetchList, pollMs, refresh]);

  useEffect(() => {
    if (!subscribeToEvents) return;
    return subscribeToEvents((event) => {
      if (event.type === 'chat_message_created') {
        void refresh();
      }
    });
  }, [subscribeToEvents, refresh]);

  const filteredChats = useMemo(
    () =>
      chats.filter(
        (chat) =>
          matchesRoleFilter(chat, roleFilter, currentUserId) &&
          matchesSearchQuery(chat, searchQuery, currentUserId),
      ),
    [chats, roleFilter, searchQuery, currentUserId],
  );

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

  const emptySubtitle =
    currentUserRole === 'user'
      ? 'Browse partners and send a message to start chatting.'
      : 'Clients will reach out when they need your services.';

  const listEmptyAfterFilter =
    !loading && chats.length > 0 && filteredChats.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('messages')}</Text>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchConversations')}
            placeholderTextColor={theme.timestamp}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.chipRow}>
          <FilterChip
            label={t('all')}
            active={roleFilter === 'all'}
            onPress={() => setRoleFilter('all')}
            theme={theme}
          />
          {currentUserRole === 'user' ? (
            <>
              <FilterChip
                label={t('partner')}
                active={roleFilter === 'partner'}
                onPress={() => setRoleFilter('partner')}
                theme={theme}
              />
              <FilterChip
                label={t('cityManager')}
                active={roleFilter === 'cm'}
                onPress={() => setRoleFilter('cm')}
                theme={theme}
              />
            </>
          ) : (
            <>
              <FilterChip
                label={t('client')}
                active={roleFilter === 'user'}
                onPress={() => setRoleFilter('user')}
                theme={theme}
              />
              {currentUserRole === 'partner' ? (
                <FilterChip
                  label={t('cityManager')}
                  active={roleFilter === 'cm'}
                  onPress={() => setRoleFilter('cm')}
                  theme={theme}
                />
              ) : (
                <FilterChip
                  label={t('partner')}
                  active={roleFilter === 'partner'}
                  onPress={() => setRoleFilter('partner')}
                  theme={theme}
                />
              )}
            </>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.listPad}>
          <SkeletonRow theme={theme} />
          <SkeletonRow theme={theme} />
          <SkeletonRow theme={theme} />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('noConversations')}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {emptySubtitle}
          </Text>
        </View>
      ) : listEmptyAfterFilter ? (
        <View style={styles.center}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('noMatches')}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            {t('tryDifferentSearch')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listPad}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
};

const CARD_RADIUS = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  searchWrap: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 15,
    paddingVertical: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listPad: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: CARD_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  nameGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    minWidth: 0,
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
    borderRadius: CARD_RADIUS,
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
    borderRadius: CARD_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  skeletonCard: {
    opacity: 0.7,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: CARD_RADIUS,
  },
  skeletonBody: {
    flex: 1,
    marginLeft: 12,
    gap: 8,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 4,
    width: '90%',
  },
  skeletonLineShort: {
    width: '55%',
  },
  skeletonLineMedium: {
    width: '70%',
  },
});
