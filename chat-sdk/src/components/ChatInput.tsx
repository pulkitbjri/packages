import React, { useState, useCallback } from 'react';
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
  sending: boolean;
  theme: ChatTheme;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  sending,
  theme,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    Keyboard.dismiss();
    await onSend(trimmed);
  }, [text, sending, onSend]);

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      <View style={[styles.inputWrapper, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={theme.timestamp}
          multiline
          maxLength={2000}
          returnKeyType="default"
          editable={!sending}
        />
      </View>
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? theme.primary : theme.border },
        ]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.7}>
        {sending ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <SendIcon color={canSend ? '#FFF' : theme.timestamp} />
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
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
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
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
