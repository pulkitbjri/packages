import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

export type PushNotificationMessage = {
  title?: string;
  body?: string;
  data?: Record<string, string>;
};

function normalizeRemoteMessage(
  msg: FirebaseMessagingTypes.RemoteMessage,
): PushNotificationMessage {
  return {
    title: msg.notification?.title,
    body: msg.notification?.body,
    data: msg.data as Record<string, string> | undefined,
  };
}

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
  callback: (remoteMessage: PushNotificationMessage) => void,
): () => void {
  return messaging().onMessage((msg) => {
    callback(normalizeRemoteMessage(msg));
  });
}

/**
 * Handles the case when the user taps a notification while the app is in
 * background (not killed).
 * Returns an unsubscribe function.
 */
export function onNotificationOpenedApp(
  callback: (remoteMessage: PushNotificationMessage) => void,
): () => void {
  return messaging().onNotificationOpenedApp((msg) => {
    callback(normalizeRemoteMessage(msg));
  });
}

/**
 * Checks if the app was opened from a killed state by tapping a
 * notification. Call once on app launch.
 */
export async function getInitialNotification(): Promise<PushNotificationMessage | null> {
  const msg = await messaging().getInitialNotification();
  if (!msg) return null;
  return normalizeRemoteMessage(msg);
}
