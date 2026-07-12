import type {
  AnalyticsConfig,
  AnalyticsProvider,
  EventParams,
  StepAction,
  UserContext,
} from './types';

let provider: AnalyticsProvider | null = null;
let config: AnalyticsConfig | null = null;
const flowIds: Record<string, string> = {};

function generateFlowId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Read Platform without a hard ESM import so Node self-checks can run. */
function readPlatform(): { os: string; version: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require('react-native') as {
      Platform: { OS: string; Version: string | number };
    };
    return { os: Platform.OS, version: String(Platform.Version) };
  } catch {
    return { os: 'unknown', version: '0' };
  }
}

export function sanitize(params?: EventParams): EventParams {
  if (!params) {
    return {};
  }
  const out: EventParams = {};
  for (const [k, v] of Object.entries(params)) {
    if (v == null) {
      continue;
    }
    if (typeof v === 'string' && v.length > 100) {
      continue;
    }
    out[k] = v;
  }
  return out;
}

function deviceDefaults(): EventParams {
  const { os, version } = readPlatform();
  return {
    app_name: config?.appName ?? '',
    platform_os: os,
    platform_version: version,
    ...(config?.appVersion ? { app_version: config.appVersion } : {}),
  };
}

/**
 * Store provider + config. Auto-sets device/app default params.
 * Safe to call once per app entry.
 */
export function init(p: AnalyticsProvider, cfg: AnalyticsConfig): void {
  provider = p;
  config = cfg;
  provider.setDefaultEventParameters(deviceDefaults()).catch(() => {});
}

/** @deprecated Use init(createFirebaseProvider(), { appName }) */
export function initAnalytics(appName: string): void {
  // Keep a soft migration path: apps that still call initAnalytics must
  // also call init with a provider. This alone is a no-op without provider.
  if (!provider) {
    config = { appName };
    return;
  }
  config = { ...(config ?? { appName }), appName };
  provider.setDefaultEventParameters(deviceDefaults()).catch(() => {});
}

export async function trackEvent(
  name: string,
  params?: EventParams,
): Promise<void> {
  if (!provider) {
    return;
  }
  try {
    await provider.logEvent(name, sanitize(params));
  } catch {
    // Never block UX on analytics
  }
}

export async function trackScreenView(
  name: string,
  cls?: string,
): Promise<void> {
  if (!provider) {
    return;
  }
  try {
    await provider.logScreenView(name, cls);
  } catch {
    // Never block UX on analytics
  }
}

export async function trackClick(
  buttonId: string,
  params?: EventParams,
): Promise<void> {
  return trackEvent('btn_click', { button_id: buttonId, ...params });
}

export async function trackStep(
  funnel: string,
  step: string,
  action: StepAction,
  params?: EventParams,
): Promise<void> {
  if (action === 'enter') {
    flowIds[funnel] = generateFlowId();
  }
  const flowId = flowIds[funnel];
  await trackEvent('funnel_step', {
    funnel,
    step,
    action,
    ...(flowId ? { flow_id: flowId } : {}),
    ...params,
  });
  if (action === 'success' || action === 'fail') {
    delete flowIds[funnel];
  }
}

export async function setUser(ctx: UserContext): Promise<void> {
  if (!provider) {
    return;
  }
  try {
    await provider.setUserId(ctx.userId);
    await provider.setDefaultEventParameters({
      ...deviceDefaults(),
      user_id: ctx.userId ?? 'anonymous',
    });
    if (ctx.properties) {
      await provider.setUserProperties(ctx.properties);
    }
  } catch {
    // Never block UX on analytics
  }
}

export function clearUser(): void {
  if (!provider) {
    return;
  }
  provider.setUserId(null).catch(() => {});
  provider
    .setDefaultEventParameters({
      ...deviceDefaults(),
      user_id: 'anonymous',
    })
    .catch(() => {});
}

/** Test helper — reset module state between tests. */
export function __resetAnalyticsForTests(): void {
  provider = null;
  config = null;
  for (const key of Object.keys(flowIds)) {
    delete flowIds[key];
  }
}
