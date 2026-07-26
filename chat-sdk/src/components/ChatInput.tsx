import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import type { ChatTheme } from '../types';

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  onSendImage?: (localUri: string) => Promise<void>;
  onPickImage?: () => Promise<string | null>;
  sending: boolean;
  theme: ChatTheme;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onSendImage,
  onPickImage,
  sending,
  theme,
  disabled = false,
  placeholder,
}) => {
  const { t } = useTranslation('chat');
  const resolvedPlaceholder = placeholder ?? t('typeMessage');
  const [text, setText] = useState('');

  const blocked = disabled || sending;

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || blocked) return;
    setText('');
    Keyboard.dismiss();
    await onSend(trimmed);
  }, [text, blocked, onSend]);

  const handleAttach = useCallback(async () => {
    if (blocked || !onPickImage || !onSendImage) return;
    const uri = await onPickImage();
    if (uri) {
      await onSendImage(uri);
    }
  }, [blocked, onPickImage, onSendImage]);

  const canSend = text.trim().length > 0 && !blocked;
  const sendColor = theme.accent || theme.primary;
  const muted = theme.timestamp;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
        disabled && styles.containerDisabled,
      ]}>
      {onPickImage && onSendImage ? (
        <TouchableOpacity
          style={[styles.attachButton, { borderColor: theme.border }]}
          onPress={handleAttach}
          disabled={blocked}
          activeOpacity={0.7}>
          <Text style={[styles.attachLabel, { color: blocked ? muted : theme.text }]}>+</Text>
        </TouchableOpacity>
      ) : null}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: disabled ? theme.receivedBubble : theme.inputBackground,
            borderColor: theme.border,
          },
        ]}>
        <TextInput
          style={[styles.input, { color: disabled ? muted : theme.text }]}
          value={text}
          onChangeText={setText}
          placeholder={resolvedPlaceholder}
          placeholderTextColor={muted}
          multiline
          maxLength={2000}
          returnKeyType="default"
          editable={!blocked}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? sendColor : theme.border },
        ]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}>
        {sending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <SendIcon color={canSend ? '#FFF' : muted} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const SendIcon: React.FC<{ color: string }> = ({ color }) => (
  <Text style={{ fontSize: 18, color, fontWeight: '700' }}>{'➤'}</Text>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  containerDisabled: {
    opacity: 0.85,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  attachLabel: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 24,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
