import commonEn from './locales/en/common.json';
import userEn from './locales/en/user.json';
import partnerEn from './locales/en/partner.json';
import chatEn from './locales/en/chat.json';
import apiEn from './locales/en/api.json';
import pushEn from './locales/en/push.json';
import smsEn from './locales/en/sms.json';

import commonHi from './locales/hi/common.json';
import userHi from './locales/hi/user.json';
import partnerHi from './locales/hi/partner.json';
import chatHi from './locales/hi/chat.json';
import apiHi from './locales/hi/api.json';
import pushHi from './locales/hi/push.json';
import smsHi from './locales/hi/sms.json';

export const SUPPORTED_LOCALES = ['en', 'hi'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const NAMESPACES = [
  'common',
  'user',
  'partner',
  'chat',
  'api',
  'push',
  'sms',
] as const;

export type I18nNamespace = (typeof NAMESPACES)[number];

export const resources = {
  en: {
    common: commonEn,
    user: userEn,
    partner: partnerEn,
    chat: chatEn,
    api: apiEn,
    push: pushEn,
    sms: smsEn,
  },
  hi: {
    common: commonHi,
    user: userHi,
    partner: partnerHi,
    chat: chatHi,
    api: apiHi,
    push: pushHi,
    sms: smsHi,
  },
} as const;

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'hi';
}

export function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) return 'en';
  const base = value.toLowerCase().split('-')[0];
  return base === 'hi' ? 'hi' : 'en';
}
