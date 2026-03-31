import analytics from '@react-native-firebase/analytics';

export type AnalyticsAppName = 'partner' | 'user';

let initialized = false;

/**
 * Sets default params on all subsequent events (including automatic collection where applicable).
 * Call once per app entry (e.g. from index.js).
 */
export async function initAnalytics(appName: AnalyticsAppName): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;
  try {
    await analytics().setDefaultEventParameters({
      app_name: appName,
    });
  } catch {
    // ignore
  }
}

function sanitizeParams(
  params?: Record<string, string | number | boolean>,
): Record<string, string | number | boolean> {
  if (!params) {
    return {};
  }
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) {
      continue;
    }
    if (typeof v === 'string' && v.length > 100) {
      continue;
    }
    out[k] = v;
  }
  return out;
}

export async function trackScreenView(
  screenName: string,
  screenClass?: string,
): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass ?? screenName,
    });
  } catch {
    // Never block UX on analytics
  }
}

export async function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    await analytics().logEvent(name, sanitizeParams(params));
  } catch {
    // ignore
  }
}
