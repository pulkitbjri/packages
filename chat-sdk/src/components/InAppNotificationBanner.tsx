import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type InAppNotificationInput = {
  title: string;
  body?: string;
  /** Called when the user taps the banner. Banner closes either way. */
  onPress?: () => void;
};

type QueuedNotification = InAppNotificationInput & { id: number };

type Listener = (notification: QueuedNotification) => void;

let listener: Listener | null = null;
let nextId = 1;

/**
 * Show a heads-up banner instead of a blocking alert.
 * ponytail: single-slot — a new notification replaces the visible one rather
 * than queueing. Upgrade path: keep an array here if stacked banners are needed.
 */
export function showInAppNotification(input: InAppNotificationInput) {
  listener?.({ ...input, id: nextId++ });
}

type HostProps = {
  accentColor?: string;
  /** Auto-dismiss delay in ms. */
  duration?: number;
  /** Distance from the top of the host's parent. */
  topOffset?: number;
};

export function InAppNotificationHost({
  accentColor = '#8B1A2B',
  duration = 4000,
  topOffset = 8,
}: HostProps) {
  const [current, setCurrent] = React.useState<QueuedNotification | null>(null);
  const anim = React.useRef(new Animated.Value(0)).current;
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = React.useCallback(
    (id: number) => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }

      Animated.timing(anim, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setCurrent((visible) => (visible?.id === id ? null : visible));
        }
      });
    },
    [anim],
  );

  React.useEffect(() => {
    listener = (notification) => setCurrent(notification);
    return () => {
      listener = null;
    };
  }, []);

  React.useEffect(() => {
    if (!current) {
      return;
    }

    anim.stopAnimation();
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => hide(current.id), duration);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [anim, current, duration, hide]);

  if (!current) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        { top: topOffset },
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-24, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${current.title}. ${current.body ?? ''}`.trim()}
        onPress={() => {
          hide(current.id);
          current.onPress?.();
        }}
        style={[styles.card, { borderLeftColor: accentColor }]}
      >
        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.title}>
            {current.title}
          </Text>
          {current.body ? (
            <Text numberOfLines={2} style={styles.body}>
              {current.body}
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          hitSlop={10}
          onPress={() => hide(current.id)}
          style={styles.close}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 8,
    ...Platform.select({
      android: { elevation: 6 },
      default: {
        shadowColor: '#111827',
        shadowOpacity: 0.12,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  body: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },
  close: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  closeIcon: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
