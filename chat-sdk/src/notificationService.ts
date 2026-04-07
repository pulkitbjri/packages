import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

/**
 * Requests push notification permissions from the user.
 * On Android 13+ this triggers the system permission dialog.
 * Returns true if authorised.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Returns the current FCM device token.
 * The consuming app should POST this to the backend after login.
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    return await messaging().getToken();
  } catch (error) {
    console.error('[chat-sdk] getFCMToken error:', error);
    return null;
  }
}

/**
 * Listens for FCM token refreshes (e.g. after app reinstall).
 * Returns an unsubscribe function.
 */
export function onTokenRefresh(
  callback: (newToken: string) => void,
): () => void {
  return messaging().onTokenRefresh(callback);
}

/**
 * Registers a callback for messages received while the app is in the
 * foreground. The consuming app should show an in-app banner / toast.
 * Returns an unsubscribe function.
 */
export function onForegroundMessage(
  callback: (remoteMessage: {
    title?: string;
    body?: string;
    data?: Record<string, string>;
  }) => void,
): () => void {
  return messaging().onMessage((msg) => {
    callback({
      title: msg.notification?.title,
      body: msg.notification?.body,
      data: msg.data as Record<string, string> | undefined,
    });
  });
}

/**
 * Handles the case when the user taps a notification while the app is in
 * background (not killed). The callback receives the chatId to navigate to.
 * Returns an unsubscribe function.
 */
export function onNotificationOpenedApp(
  navigate: (chatId: string, otherPartyName: string) => void,
): () => void {
  return messaging().onNotificationOpenedApp((msg) => {
    const chatId = msg.data?.chatId as string | undefined;
    const otherPartyName = (msg.data?.senderName as string) ?? 'Chat';
    if (chatId) {
      navigate(chatId, otherPartyName);
    }
  });
}

/**
 * Checks if the app was opened from a killed state by tapping a
 * notification. Call once on app launch.
 */
export async function getInitialNotification(): Promise<{
  chatId: string;
  otherPartyName: string;
} | null> {
  const msg = await messaging().getInitialNotification();
  if (!msg?.data?.chatId) return null;
  return {
    chatId: msg.data.chatId as string,
    otherPartyName: (msg.data.senderName as string) ?? 'Chat',
  };
}
