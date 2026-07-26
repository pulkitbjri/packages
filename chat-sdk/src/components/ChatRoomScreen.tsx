import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { ChatParticipantRole, ChatRoomScreenProps, Message } from '../types';
import { useChatMessagesApi } from '../hooks/useChatMessagesApi';
import { useBackendChatMessaging } from '../hooks/useBackendChatMessaging';
import { resolveTheme } from './defaultTheme';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

function formatRoleCaption(
  role: ChatParticipantRole | undefined,
  t: (key: string) => string,
): string | null {
  if (!role) return null;
  if (role === 'cm') return t('cityManager');
  if (role === 'partner') return t('partner');
  if (role === 'user') return t('client');
  return null;
}

function humanizeLockReason(
  reason: string | null | undefined,
  t: (key: string) => string,
): string {
  switch (reason) {
    case 'token_payment_required':
      return t('completeToken');
    case 'advance_payment_required':
      return t('advancePaymentRequired');
    default:
      if (reason?.trim()) {
        return reason.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) + '.';
      }
      return t('chatLocked');
  }
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  chatId,
  currentUserId,
  otherPartyName,
  otherPartyRole,
  bookingLabel,
  loadMessagesViaApi,
  onBack,
  theme: themeOverride,
  locked = false,
  lockReason,
  pickImage,
  sendError: sendErrorProp,
}) => {
  const { t } = useTranslation('chat');
  const theme = resolveTheme(themeOverride);
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const sendError = sendErrorProp ?? localSendError;

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

  const messaging = useBackendChatMessaging(chatId, {
    sendViaApi: useApiList ? loadMessagesViaApi?.sendMessage : undefined,
    uploadMedia: useApiList ? loadMessagesViaApi?.uploadMedia : undefined,
    onSendComplete: useApiList
      ? () => {
          void refetchRef.current();
        }
      : undefined,
  });

  const messages = apiState.messages;
  const loading = apiState.loading;
  const loadMore = apiState.loadMore;
  const hasMore = apiState.hasMore;
  const send = messaging.send;
  const sendImage = messaging.sendImage;
  const sending = messaging.sending;

  const listRef = useRef<FlatList<Message>>(null);

  const handleSend = useCallback(
    async (text: string) => {
      if (sendErrorProp == null) {
        setLocalSendError(null);
      }
      try {
        await send(text);
      } catch {
        if (sendErrorProp == null) {
          setLocalSendError(t('sendFailed'));
        }
      }
    },
    [send, sendErrorProp, t],
  );

  const handleSendImage = useCallback(
    async (localUri: string) => {
      if (sendErrorProp == null) {
        setLocalSendError(null);
      }
      try {
        await sendImage(localUri);
      } catch {
        if (sendErrorProp == null) {
          setLocalSendError(t('sendFailed'));
        }
      }
    },
    [sendImage, sendErrorProp, t],
  );

  const roleCaption = formatRoleCaption(otherPartyRole, t);
  const displayName = otherPartyName?.trim() ? otherPartyName.trim() : t('chat');
  const lockBannerText = useMemo(
    () => humanizeLockReason(lockReason, t),
    [lockReason, t],
  );
  const composerDisabled = locked;

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

  const pickImageHandler =
    pickImage && loadMessagesViaApi?.uploadMedia ? pickImage : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}>
        <TouchableOpacity
          onPress={() => onBack?.()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.backArrow, { color: theme.text }]}>{'‹'}</Text>
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          {roleCaption ? (
            <Text style={[styles.headerRole, { color: theme.primary }]} numberOfLines={1}>
              {roleCaption}
            </Text>
          ) : null}
          {bookingLabel?.trim() ? (
            <Text
              style={[styles.headerBooking, { color: theme.textSecondary }]}
              numberOfLines={1}>
              {bookingLabel.trim()}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {locked ? (
        <View style={[styles.lockBanner, { backgroundColor: theme.receivedBubble, borderBottomColor: theme.border }]}>
          <Text style={[styles.lockBannerText, { color: theme.text }]}>
            {lockBannerText}
          </Text>
        </View>
      ) : null}

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
              {t('noMessagesYet')}
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

        {sendError ? (
          <Text style={[styles.sendError, { color: theme.accent || theme.primary }]}>
            {sendError}
          </Text>
        ) : null}

        <ChatInput
          onSend={handleSend}
          onSendImage={pickImageHandler ? handleSendImage : undefined}
          onPickImage={pickImageHandler}
          sending={sending}
          theme={theme}
          disabled={composerDisabled}
        />
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
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  headerBooking: {
    fontSize: 12,
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  lockBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lockBannerText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
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
  sendError: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
});
