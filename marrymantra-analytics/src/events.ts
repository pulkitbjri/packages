/**
 * MarryMantra event / funnel catalog.
 * Keep in sync with docs/EVENT_TAXONOMY.md and backend Ga4AnalyticsService strings.
 *
 * PII rule: params must be enum-like or opaque IDs only — never name, phone, notes.
 */
export const AnalyticsEvents = {
  btn_click: 'btn_click',
  funnel_step: 'funnel_step',
  otp_requested: 'otp_requested',
  login_success: 'login_success',
  login_failed: 'login_failed',
  registration_completed: 'registration_completed',
  kyc_submitted: 'kyc_submitted',
  assignment_accepted: 'assignment_accepted',
  booking_created: 'booking_created',
  booking_confirmed: 'booking_confirmed',
  payment_initiated: 'payment_initiated',
  payment_succeeded: 'payment_succeeded',
  payment_failed: 'payment_failed',
  chat_open: 'chat_open',
  chat_send: 'chat_send',
  favorite_toggled: 'favorite_toggled',
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export const Funnels = {
  user_package_booking: 'user_package_booking',
  user_direct_booking: 'user_direct_booking',
  user_auth: 'user_auth',
  user_claim_booking: 'user_claim_booking',
  user_home_visit: 'user_home_visit',
  partner_auth: 'partner_auth',
  partner_on_behalf_booking: 'partner_on_behalf_booking',
  partner_kyc: 'partner_kyc',
  partner_assignment: 'partner_assignment',
} as const;

export const Steps = {
  user_package_booking: {
    entry: 'entry',
    event_type: 'event_type',
    booking_form: 'booking_form',
    packages: 'packages',
    package_detail: 'package_detail',
    sp_select: 'sp_select',
    payment_policy: 'payment_policy',
    confirmation: 'confirmation',
    payment: 'payment',
    booked: 'booked',
  },
  user_direct_booking: {
    services_hub: 'services_hub',
    provider_list: 'provider_list',
    partner_profile: 'partner_profile',
    package: 'package',
    direct_book_submit: 'direct_book_submit',
  },
  user_auth: {
    login: 'login',
    otp_requested: 'otp_requested',
    otp_verify: 'otp_verify',
    registration: 'registration',
    completed: 'completed',
  },
  user_claim_booking: {
    claim_open: 'claim_open',
    claim_success: 'claim_success',
    vendors: 'vendors',
  },
  user_home_visit: {
    entry: 'entry',
    agent: 'agent',
    otp: 'otp',
    office: 'office',
  },
  partner_on_behalf_booking: {
    event_type: 'event_type',
    details: 'details',
    packages: 'packages',
    package_detail: 'package_detail',
    review: 'review',
    payment_policy: 'payment_policy',
    confirmation: 'confirmation',
    payment: 'payment',
    booked: 'booked',
  },
  partner_kyc: {
    identity: 'identity',
    bank: 'bank',
    license: 'license',
    venue: 'venue',
    payment_policy: 'payment_policy',
    agreements: 'agreements',
    submitted: 'submitted',
    fee_payment: 'fee_payment',
  },
  partner_assignment: {
    list: 'list',
    detail: 'detail',
    accept: 'accept',
    reject: 'reject',
    collect_advance: 'collect_advance',
  },
} as const;
