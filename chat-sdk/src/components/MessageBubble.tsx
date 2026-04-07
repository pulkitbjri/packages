import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { Message, ChatTheme } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  theme: ChatTheme;
  showSenderName?: boolean;
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  theme,
  showSenderName = false,
}) => {
  const bubbleBg = isOwn ? theme.sentBubble : theme.receivedBubble;
  const textColor = isOwn ? theme.sentBubbleText : theme.receivedBubbleText;

  return (
    <View
      style={[
        styles.wrapper,
        isOwn ? styles.wrapperOwn : styles.wrapperOther,
      ]}>
      <View style={[styles.bubble, { backgroundColor: bubbleBg }]}>
        {showSenderName && !isOwn && (
          <Text style={[styles.senderName, { color: theme.primary }]}>
            {message.senderName}
          </Text>
        )}
        {message.imageUrl ? (
          <Image source={{ uri: message.imageUrl }} style={styles.image} />
        ) : null}
        {message.text ? (
          <Text style={[styles.messageText, { color: textColor }]}>
            {message.text}
          </Text>
        ) : null}
        <Text style={[styles.time, { color: isOwn ? 'rgba(255,255,255,0.7)' : theme.timestamp }]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 2,
    paddingHorizontal: 12,
  },
  wrapperOwn: {
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});

export const MessageBubble = memo(MessageBubbleComponent);
