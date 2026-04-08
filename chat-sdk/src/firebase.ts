import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

/**
 * Firebase is initialised automatically by @react-native-firebase when
 * google-services.json / GoogleService-Info.plist is present.
 *
 * This module simply re-exports the shared Firestore instance so every
 * service file in the SDK references the same database connection.
 */
let _db: ReturnType<typeof firestore> | null = null;

export type ChatSdkConfig = {
  liveFirestore?: boolean;
};

const sdkConfig = {
  liveFirestore: false,
};

export let USE_LIVE_FIRESTORE_CHAT = sdkConfig.liveFirestore;

try {
  _db = firestore();
} catch (e) {
  _db = null;
  // eslint-disable-next-line no-console
  console.warn('[chat-sdk] Firestore not ready:', e);
}

/** True when Firestore initialized and live chat is enabled. */
export let firestoreReady = Boolean(_db) && sdkConfig.liveFirestore;

export function configureChatSdk(config: ChatSdkConfig): void {
  if (typeof config.liveFirestore === 'boolean') {
    sdkConfig.liveFirestore = config.liveFirestore;
  }
  USE_LIVE_FIRESTORE_CHAT = sdkConfig.liveFirestore;
  firestoreReady = Boolean(_db) && sdkConfig.liveFirestore;
}

export function getChatSdkConfig() {
  return { ...sdkConfig };
}

if (__DEV__ && _db && !USE_LIVE_FIRESTORE_CHAT) {
  // eslint-disable-next-line no-console
  console.log(
    '[chat-sdk] Firestore is installed; chat remains disabled until the host enables liveFirestore.',
  );
}

export const db = _db;
export { firebase };
