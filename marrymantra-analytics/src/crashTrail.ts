/**
 * Crashlytics breadcrumbs. Lazy-load so Node self-checks and web consumers
 * do not need @react-native-firebase/crashlytics.
 * PII: never log phone, token, name, notes — keys and messages are enums/ids.
 */
const MAX_LOG = 800;

type CrashlyticsMod = {
  getCrashlytics: () => unknown;
  log: (instance: unknown, message: string) => void;
  setAttribute: (instance: unknown, name: string, value: string) => Promise<unknown>;
  setUserId: (instance: unknown, userId: string) => Promise<unknown>;
};

let cached: CrashlyticsMod | null | undefined;

function api(): CrashlyticsMod | null {
  if (cached !== undefined) {
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const raw = require('@react-native-firebase/crashlytics') as CrashlyticsMod & {
      default?: CrashlyticsMod;
    };
    const mod: CrashlyticsMod = {
      getCrashlytics: raw.getCrashlytics ?? raw.default?.getCrashlytics,
      log: raw.log ?? raw.default?.log,
      setAttribute: raw.setAttribute ?? raw.default?.setAttribute,
      setUserId: raw.setUserId ?? raw.default?.setUserId,
    };
    cached =
      typeof mod.getCrashlytics === 'function' && typeof mod.log === 'function'
        ? mod
        : null;
  } catch {
    cached = null;
  }
  return cached;
}

function instance(): unknown | null {
  const mod = api();
  if (!mod) {
    return null;
  }
  try {
    return mod.getCrashlytics();
  } catch {
    return null;
  }
}

export function trail(message: string): void {
  const mod = api();
  const crash = instance();
  if (!mod || !crash) {
    return;
  }
  try {
    mod.log(crash, message.slice(0, MAX_LOG));
  } catch {
    // Never block UX
  }
}

export function setTrailKey(name: string, value: string): void {
  if (typeof name !== 'string' || typeof value !== 'string' || !value) {
    return;
  }
  const mod = api();
  const crash = instance();
  if (!mod || !crash) {
    return;
  }
  try {
    void mod.setAttribute(crash, name, value.slice(0, 100)).catch(() => {});
  } catch {
    // Never block UX
  }
}

export function setCrashUserId(userId: string | null): void {
  const mod = api();
  const crash = instance();
  if (!mod || !crash) {
    return;
  }
  void mod.setUserId(crash, userId ?? '').catch(() => {});
}

const EVENT_KEYS = ['funnel', 'step', 'action', 'button_id'] as const;

export function trailEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  const bits = [`evt:${name}`];
  if (params) {
    for (const key of EVENT_KEYS) {
      const value = params[key];
      if (value != null && value !== '') {
        bits.push(`${key}=${value}`);
      }
    }
    if (typeof params.funnel === 'string') {
      setTrailKey('last_funnel', params.funnel);
    }
    if (typeof params.step === 'string') {
      setTrailKey('last_step', params.step);
    }
  }
  trail(bits.join(' '));
}

export function trailScreen(name: string): void {
  trail(`nav:${name}`);
  setTrailKey('last_screen', name);
}
