import {
  getAnalytics,
  logEvent,
  logScreenView,
  setDefaultEventParameters,
  setUserId,
  setUserProperties,
} from '@react-native-firebase/analytics';

import type { AnalyticsProvider } from './types';

export function createFirebaseProvider(): AnalyticsProvider {
  const analytics = getAnalytics();
  return {
    logEvent: (name, params) => logEvent(analytics, name, params ?? {}),
    logScreenView: (screenName, screenClass) =>
      logScreenView(analytics, {
        screen_name: screenName,
        screen_class: screenClass ?? screenName,
      }),
    setUserId: (uid) => setUserId(analytics, uid),
    setUserProperties: (props) => setUserProperties(analytics, props),
    setDefaultEventParameters: (params) =>
      setDefaultEventParameters(analytics, params),
  };
}
