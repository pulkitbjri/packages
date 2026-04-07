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

/**
 * Live Firestore chat (listeners + writes) is **opt-in**.
 *
 * - `false` (default): SDK uses demo chat data — no `permission-denied` noise, good for local dev.
 * - `true`: use real Firestore; you **must** deploy rules (see repo `firestore.rules` + `FIRESTORE_SETUP.md`).
 *
 * @example Turn on after rules are published in Firebase Console:
 *   export const USE_LIVE_FIRESTORE_CHAT = true;
 */
export const USE_LIVE_FIRESTORE_CHAT = true;

try {
  _db = firestore();
} catch (e) {
  _db = null;
  // eslint-disable-next-line no-console
  console.warn('[chat-sdk] Firestore not ready:', e);
}

/** True when Firestore initialized and live chat is enabled. */
export const firestoreReady = Boolean(_db) && USE_LIVE_FIRESTORE_CHAT;

if (__DEV__ && _db && !USE_LIVE_FIRESTORE_CHAT) {
  // eslint-disable-next-line no-console
  console.log(
    '[chat-sdk] Firestore is installed; chat uses demo data. Set USE_LIVE_FIRESTORE_CHAT=true in firebase.ts after deploying Firestore rules.',
  );
}

export const db = _db;
export { firebase };
