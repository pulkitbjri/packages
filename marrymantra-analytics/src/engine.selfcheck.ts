/**
 * Tiny self-check for sanitize + trackStep flow_id lifecycle.
 * ponytail: assert-based demo, no test framework required.
 */
import type { AnalyticsProvider, EventParams } from './types';
import {
  __resetAnalyticsForTests,
  init,
  sanitize,
  trackStep,
} from './engine';

function assert(cond: unknown, msg: string): void {
  if (!cond) {
    throw new Error(msg);
  }
}

async function main(): Promise<void> {
  const logged: Array<{ name: string; params?: EventParams }> = [];

  const mockProvider: AnalyticsProvider = {
    logEvent: async (name, params) => {
      logged.push({ name, params });
    },
    logScreenView: async () => {},
    setUserId: async () => {},
    setUserProperties: async () => {},
    setDefaultEventParameters: async () => {},
  };

  __resetAnalyticsForTests();
  init(mockProvider, { appName: 'user', appVersion: '1.0.0' });

  assert(
    sanitize({ a: 'ok', b: null as unknown as string }).a === 'ok',
    'sanitize drops null',
  );
  assert(
    sanitize({ long: 'x'.repeat(101) }).long === undefined,
    'sanitize drops long strings',
  );

  await trackStep('user_package_booking', 'entry', 'enter');
  await trackStep('user_package_booking', 'packages', 'continue');
  const enter = logged.find((e) => e.params?.action === 'enter');
  const cont = logged.find((e) => e.params?.action === 'continue');
  assert(enter?.params?.flow_id, 'enter has flow_id');
  assert(
    enter?.params?.flow_id === cont?.params?.flow_id,
    'flow_id stable within attempt',
  );

  await trackStep('user_package_booking', 'booked', 'success');
  logged.length = 0;
  await trackStep('user_package_booking', 'entry', 'enter');
  const next = logged.find((e) => e.params?.action === 'enter');
  assert(
    next?.params?.flow_id && next.params.flow_id !== enter?.params?.flow_id,
    'new flow_id on next enter',
  );

  console.log('engine.selfcheck: ok');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
