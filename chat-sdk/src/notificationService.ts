import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

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
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (status !== PermissionsAndroid.RESULTS.GRANTED) {
      return false;
    }
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

const TRANSIENT_FCM_MARKERS = [
  'SERVICE_NOT_AVAILABLE',
  'AUTHENTICATION_FAILED',
  'FIS_AUTH_ERROR',
  'MISSING_INSTANCEID_SERVICE',
  'TOO_MANY_REGISTRATIONS',
];

function isTransientFcmFailure(message: string): boolean {
  const upper = message.toUpperCase();
  return TRANSIENT_FCM_MARKERS.some((marker) => upper.includes(marker));
}

async function fetchFcmToken(): Promise<string> {
  if (!messaging().isDeviceRegisteredForRemoteMessages) {
    await messaging().registerDeviceForRemoteMessages();
  }
  return messaging().getToken();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the current FCM device token.
 * The consuming app should POST this to the backend after login.
 */
export async function getFCMToken(): Promise<string | null> {
  // ponytail: 3 tries covers cold Play Services on emulators; give up after that.
  const retryDelaysMs = [0, 1500, 3000];
  let lastError: unknown;

  for (const waitMs of retryDelaysMs) {
    if (waitMs > 0) {
      await delay(waitMs);
    }
    try {
      return await fetchFcmToken();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!isTransientFcmFailure(message)) {
        console.error('[chat-sdk] getFCMToken error:', error);
        return null;
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  console.warn('[chat-sdk] getFCMToken unavailable:', message);
  return null;
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
