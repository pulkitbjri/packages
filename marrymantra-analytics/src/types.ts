export type EventParams = Record<string, string | number | boolean>;

export interface AnalyticsProvider {
  logEvent(name: string, params?: EventParams): Promise<void>;
  logScreenView(screenName: string, screenClass?: string): Promise<void>;
  setUserId(userId: string | null): Promise<void>;
  setUserProperties(props: Record<string, string | null>): Promise<void>;
  setDefaultEventParameters(params: EventParams): Promise<void>;
}

export type StepAction = 'enter' | 'continue' | 'success' | 'fail' | 'back';

export interface AnalyticsConfig {
  appName: string;
  appVersion?: string;
}

export interface UserContext {
  userId: string | null;
  properties?: Record<string, string | null>;
}
