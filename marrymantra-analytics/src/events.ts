/**
 * Canonical event names (snake_case) — keep in sync with docs/EVENT_TAXONOMY.md and backend Ga4AnalyticsService.
 */
export const AnalyticsEvents = {
  login_success: 'login_success',
  login_failed: 'login_failed',
  registration_completed: 'registration_completed',
  kyc_submitted: 'kyc_submitted',
  booking_created: 'booking_created',
  booking_confirmed: 'booking_confirmed',
  payment_succeeded: 'payment_succeeded',
  payment_initiated: 'payment_initiated',
  payment_failed: 'payment_failed',
  assignment_accepted: 'assignment_accepted',
  otp_requested: 'otp_requested',
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];
