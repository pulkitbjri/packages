import { ActionSheetIOS, Alert, Platform } from 'react-native';
import {
  CHAT_MODERATION_DETAILS_MAX,
  CHAT_MODERATION_REASONS,
  type ChatModerationReason,
} from './types';

const REASON_LABELS: Record<ChatModerationReason, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Harassment',
  HATE: 'Hate speech',
  SEXUAL: 'Sexual content',
  SCAM: 'Scam',
  OTHER: 'Other',
};

export type ModerationSheetTarget =
  | { kind: 'peer' }
  | { kind: 'message'; messageId: string };

function trimDetails(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t) return undefined;
  return t.slice(0, CHAT_MODERATION_DETAILS_MAX);
}

function promptDetails(
  onDone: (details?: string) => void,
): void {
  if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
    Alert.prompt(
      'Add details (optional)',
      `Max ${CHAT_MODERATION_DETAILS_MAX} characters`,
      [
        { text: 'Skip', style: 'cancel', onPress: () => onDone(undefined) },
        {
          text: 'Submit',
          onPress: (text?: string) => onDone(trimDetails(text)),
        },
      ],
      'plain-text',
    );
    return;
  }
  // Android Alert has no text prompt — submit reason only (details optional).
  Alert.alert('Submit report?', 'You can add more detail when contacting support.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Submit', onPress: () => onDone(undefined) },
  ]);
}

function pickReason(onPick: (reason: ChatModerationReason) => void): void {
  const labels = CHAT_MODERATION_REASONS.map((r) => REASON_LABELS[r]);
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...labels, 'Cancel'],
        cancelButtonIndex: labels.length,
        title: 'Why are you reporting?',
      },
      (index) => {
        if (index == null || index >= CHAT_MODERATION_REASONS.length) return;
        onPick(CHAT_MODERATION_REASONS[index]);
      },
    );
    return;
  }
  Alert.alert(
    'Why are you reporting?',
    undefined,
    [
      ...CHAT_MODERATION_REASONS.map((reason) => ({
        text: REASON_LABELS[reason],
        onPress: () => onPick(reason),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ],
  );
}

export function promptReportFlow(
  onSubmit: (reason: ChatModerationReason, details?: string) => void,
): void {
  pickReason((reason) => {
    promptDetails((details) => onSubmit(reason, details));
  });
}

export type ChatMenuAction = 'report' | 'block' | 'unblock' | 'contact';

export function showChatModerationMenu(args: {
  isPeerBlocked: boolean;
  canBlock: boolean;
  onAction: (action: ChatMenuAction) => void;
}): void {
  const { isPeerBlocked, canBlock, onAction } = args;
  const options: { key: ChatMenuAction; label: string }[] = [
    { key: 'report', label: 'Report' },
  ];
  if (canBlock) {
    options.push({
      key: isPeerBlocked ? 'unblock' : 'block',
      label: isPeerBlocked ? 'Unblock' : 'Block',
    });
  }
  options.push({ key: 'contact', label: 'Contact support' });

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [...options.map((o) => o.label), 'Cancel'],
        cancelButtonIndex: options.length,
        destructiveButtonIndex: canBlock && !isPeerBlocked ? 1 : undefined,
      },
      (index) => {
        if (index == null || index >= options.length) return;
        onAction(options[index].key);
      },
    );
    return;
  }

  Alert.alert(
    'Chat options',
    undefined,
    [
      ...options.map((o) => ({
        text: o.label,
        style:
          o.key === 'block' ? ('destructive' as const) : ('default' as const),
        onPress: () => onAction(o.key),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ],
  );
}
