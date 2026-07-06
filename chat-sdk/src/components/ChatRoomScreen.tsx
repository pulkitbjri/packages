import React, { useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { ChatRoomScreenProps, Message } from '../types';
import { useChatMessagesApi } from '../hooks/useChatMessagesApi';
import { useBackendChatMessaging } from '../hooks/useBackendChatMessaging';
import { resolveTheme } from './defaultTheme';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  chatId,
  currentUserId,
  currentUserName,
  otherPartyName,
  loadMessagesViaApi,
  onBack,
  theme: themeOverride,
}) => {
  const theme = resolveTheme(themeOverride);
  const useApiList = Boolean(loadMessagesViaApi?.fetchPage);

  const noopFetch = useCallback(
    async (): Promise<{
      messages: Message[];
      nextCursor: string | null;
    }> => ({ messages: [], nextCursor: null }),
    [],
  );

  const fetchPage = loadMessagesViaApi?.fetchPage ?? noopFetch;

  const apiState = useChatMessagesApi(chatId, currentUserId, fetchPage, {
    enabled: Boolean(chatId),
    pollIntervalMs: loadMessagesViaApi?.pollIntervalMs,
    limit: loadMessagesViaApi?.limit,
    subscribeToEvents: loadMessagesViaApi?.subscribeToEvents,
    markRead: loadMessagesViaApi?.markRead,
  });

  const refetchRef = useRef(apiState.refetch);
  useEffect(() => {
    refetchRef.current = apiState.refetch;
  }, [apiState.refetch]);

  const messaging = useBackendChatMessaging(
    chatId,
    {
      sendViaApi: useApiList ? loadMessagesViaApi?.sendMessage : undefined,
      uploadMedia: useApiList ? loadMessagesViaApi?.uploadMedia : undefined,
      onSendComplete: useApiList
        ? () => {
            void refetchRef.current();
          }
        : undefined,
    },
  );

  const messages = apiState.messages;
  const loading = apiState.loading;
  const loadMore = apiState.loadMore;
  const hasMore = apiState.hasMore;
  const send = messaging.send;
  const sending = messaging.sending;

  const listRef = useRef<FlatList<Message>>(null);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble
        message={item}
        isOwn={String(item.senderId) === String(currentUserId)}
        theme={theme}
      />
    ),
    [currentUserId, theme],
  );

  const keyExtractor = useCallback((item: Message) => item.messageId, []);

  const handleContentSizeChange = useCallback(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => onBack?.()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.backArrow, { color: theme.text }]}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarLetter}>
              {String(otherPartyName ?? 'Partner')
                .trim()
                .charAt(0)
                .toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {otherPartyName?.trim() ? otherPartyName : 'Partner'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No messages yet. Say hello!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={handleContentSizeChange}
            onStartReached={hasMore ? loadMore : undefined}
            onStartReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
          />
        )}

        <ChatInput onSend={send} sending={sending} theme={theme} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingRight: 8,
  },
  backArrow: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 34,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingVertical: 12,
  },
});
