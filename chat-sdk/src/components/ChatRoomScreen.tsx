import React, { useRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import type {
  ChatParticipantRole,
  ChatRoomScreenProps,
  Message,
} from '../types';
import { useChatMessagesApi } from '../hooks/useChatMessagesApi';
import { useBackendChatMessaging } from '../hooks/useBackendChatMessaging';
import { resolveTheme } from './defaultTheme';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import {
  promptReportFlow,
  showChatModerationMenu,
} from '../moderationSheets';

function formatRoleCaption(role?: ChatParticipantRole): string | null {
  if (!role) return null;
  if (role === 'cm') return 'City Manager';
  if (role === 'partner') return 'Partner';
  if (role === 'user') return 'Client';
  return null;
}

function humanizeLockReason(reason: string | null | undefined): string {
  switch (reason) {
    case 'token_payment_required':
      return 'Complete token payment to chat.';
    case 'advance_payment_required':
      return 'Complete advance payment to chat.';
    default:
      if (reason?.trim()) {
        return reason.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) + '.';
      }
      return 'Chat is locked.';
  }
}

async function runModerationAction(
  label: string,
  action: () => Promise<void>,
): Promise<void> {
  try {
    await action();
  } catch (err) {
    const message =
      err instanceof Error && err.message.trim()
        ? err.message
        : `Could not ${label}. Try again.`;
    Alert.alert('Something went wrong', message);
  }
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({
  chatId,
  currentUserId,
  otherPartyName,
  otherPartyRole,
  bookingLabel,
  otherUserId,
  threadParticipantIds,
  loadMessagesViaApi,
  onBack,
  theme: themeOverride,
  locked = false,
  lockReason,
  pickImage,
  sendError: sendErrorProp,
  otherPartyAvatarUrl,
  onOtherPartyPress,
  moderation,
}) => {
  const theme = resolveTheme(themeOverride);
  const [localSendError, setLocalSendError] = useState<string | null>(null);
  const [headerImgFailed, setHeaderImgFailed] = useState(false);
  const sendError = sendErrorProp ?? localSendError;

  useEffect(() => {
    setHeaderImgFailed(false);
  }, [otherPartyAvatarUrl]);

  const useApiList = Boolean(loadMessagesViaApi?.fetchPage);

  const noopFetch = useCallback(async () => ({ messages: [] as Message[], nextCursor: null as string | null }), []);

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

  const { messages, loading, loadMore, hasMore } = apiState;
  const { send, sendImage, sending } = messaging;
  const listRef = useRef<FlatList<Message>>(null);

  const resolvedPeerId = useMemo(() => {
    const fromRoute = otherUserId?.trim();
    if (fromRoute) return fromRoute;
    const others = (threadParticipantIds ?? []).filter(
      (id) => String(id) !== String(currentUserId) && String(id).trim() !== '',
    );
    return others.length === 1 ? String(others[0]) : undefined;
  }, [otherUserId, threadParticipantIds, currentUserId]);

  const isPeerBlocked = Boolean(moderation?.isPeerBlocked);
  const canBlock = Boolean(moderation && resolvedPeerId);
  const composerDisabled = locked || isPeerBlocked;

  const handleSend = useCallback(
    async (text: string) => {
      if (sendErrorProp == null) setLocalSendError(null);
      try {
        await send(text);
      } catch {
        if (sendErrorProp == null) {
          setLocalSendError('Message could not be sent. Try again.');
        }
      }
    },
    [send, sendErrorProp],
  );

  const handleSendImage = useCallback(
    async (localUri: string) => {
      if (sendErrorProp == null) setLocalSendError(null);
      try {
        await sendImage(localUri);
      } catch {
        if (sendErrorProp == null) {
          setLocalSendError('Image could not be sent. Try again.');
        }
      }
    },
    [sendImage, sendErrorProp],
  );

  const handleReportPeer = useCallback(() => {
    if (!moderation) return;
    promptReportFlow((reason, details) => {
      void runModerationAction('report', () => moderation.reportPeer(reason, details));
    });
  }, [moderation]);

  const handleReportMessage = useCallback(
    (messageId: string) => {
      if (!moderation) return;
      promptReportFlow((reason, details) => {
        void runModerationAction('report message', () =>
          moderation.reportMessage(messageId, reason, details),
        );
      });
    },
    [moderation],
  );

  const handleOpenMenu = useCallback(() => {
    if (!moderation) return;
    showChatModerationMenu({
      isPeerBlocked,
      canBlock,
      onAction: (action) => {
        if (action === 'report') {
          handleReportPeer();
          return;
        }
        if (action === 'contact') {
          moderation.onContactSupport();
          return;
        }
        if (action === 'block') {
          Alert.alert(
            'Block this person?',
            'You will stop seeing their messages in this chat.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Block',
                style: 'destructive',
                onPress: () => {
                  void runModerationAction('block', () => moderation.blockPeer());
                },
              },
            ],
          );
          return;
        }
        if (action === 'unblock') {
          void runModerationAction('unblock', () => moderation.unblockPeer());
        }
      },
    });
  }, [moderation, isPeerBlocked, canBlock, handleReportPeer]);

  const roleCaption = formatRoleCaption(otherPartyRole);
  const displayName = otherPartyName?.trim() ? otherPartyName.trim() : 'Chat';
  const avatarUrl = otherPartyAvatarUrl?.trim() ? otherPartyAvatarUrl.trim() : null;
  const showHeaderAvatarImage = Boolean(avatarUrl && !headerImgFailed);

  const headerTitleBlock = (
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
        <Text style={[styles.headerBooking, { color: theme.textSecondary }]} numberOfLines={1}>
          {bookingLabel.trim()}
        </Text>
      ) : null}
    </View>
  );

  const headerAvatar = showHeaderAvatarImage ? (
    <Image
      source={{ uri: avatarUrl! }}
      style={[styles.headerAvatar, styles.headerAvatarImage]}
      onError={() => setHeaderImgFailed(true)}
    />
  ) : (
    <View style={[styles.headerAvatar, { backgroundColor: theme.primary }]}>
      <Text style={styles.headerAvatarText}>
        {(displayName || '?').charAt(0).toUpperCase()}
      </Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isOwn = String(item.senderId) === String(currentUserId);
      return (
        <MessageBubble
          message={item}
          isOwn={isOwn}
          theme={theme}
          onLongPress={
            !isOwn && moderation
              ? () => handleReportMessage(item.messageId)
              : undefined
          }
        />
      );
    },
    [currentUserId, theme, moderation, handleReportMessage],
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
        {onOtherPartyPress ? (
          <TouchableOpacity
            style={styles.headerIdentity}
            onPress={onOtherPartyPress}
            activeOpacity={0.7}>
            {headerAvatar}
            {headerTitleBlock}
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIdentity}>
            {headerAvatar}
            {headerTitleBlock}
          </View>
        )}
        {moderation ? (
          <TouchableOpacity
            onPress={handleOpenMenu}
            style={styles.menuButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Chat options">
            <Text style={[styles.menuDots, { color: theme.text }]}>⋮</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {locked && !isPeerBlocked ? (
        <View
          style={[
            styles.lockBanner,
            {
              backgroundColor: theme.receivedBubble,
              borderBottomColor: theme.border,
            },
          ]}>
          <Text style={[styles.lockBannerText, { color: theme.text }]}>
            {humanizeLockReason(lockReason)}
          </Text>
        </View>
      ) : null}

      <View style={styles.flex}>
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

        {sendError ? (
          <Text style={[styles.sendError, { color: theme.accent || theme.primary }]}>
            {sendError}
          </Text>
        ) : null}

        <KeyboardStickyView>
          {isPeerBlocked && moderation ? (
            <View
              style={[
                styles.blockedComposer,
                { backgroundColor: theme.surface, borderTopColor: theme.border },
              ]}>
              <Text style={[styles.blockedText, { color: theme.textSecondary }]}>
                You blocked this person.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Unblock user"
                onPress={() => {
                  void runModerationAction('unblock', () => moderation.unblockPeer());
                }}
                style={[styles.unblockButton, { borderColor: theme.primary }]}>
                <Text style={[styles.unblockButtonText, { color: theme.primary }]}>
                  Unblock
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ChatInput
              onSend={handleSend}
              onSendImage={pickImageHandler ? handleSendImage : undefined}
              onPickImage={pickImageHandler}
              sending={sending}
              theme={theme}
              disabled={composerDisabled}
            />
          )}
        </KeyboardStickyView>
      </View>
    </SafeAreaView>
  );
};

const HEADER_RADIUS = 12;

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: { paddingRight: 8 },
  backArrow: { fontSize: 32, fontWeight: '300', lineHeight: 34 },
  headerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: 10,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: HEADER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarImage: { backgroundColor: '#E5E7EB' },
  headerAvatarText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  headerTextBlock: { flex: 1, minWidth: 0 },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  headerRole: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  headerBooking: { fontSize: 12, marginTop: 2 },
  headerSpacer: { width: 32 },
  menuButton: { width: 32, alignItems: 'center', justifyContent: 'center' },
  menuDots: { fontSize: 22, fontWeight: '700', lineHeight: 24 },
  lockBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  lockBannerText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  listContent: { paddingVertical: 12 },
  sendError: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  blockedComposer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 10,
  },
  blockedText: { fontSize: 14, textAlign: 'center' },
  unblockButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  unblockButtonText: { fontSize: 14, fontWeight: '600' },
});
