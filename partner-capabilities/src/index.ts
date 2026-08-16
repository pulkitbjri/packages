export type PartnerRoleCode =
  | 'TENT_PARTNER'
  | 'CATERING_PARTNER'
  | 'VENUE_PARTNER'
  | 'PHOTOGRAPHY_PARTNER'
  | 'EVENT_MANAGER'
  | 'MAKEUP_ARTIST'
  | 'MEHNDI_ARTIST'
  | 'PANDIT_JI'
  | 'INVITATION_CARD'
  | 'GIFT_PARTNER'
  | 'JEWELLERS_PARTNER'
  | 'TENT_FABRICATOR'
  | 'CLOTHING_PARTNER'
  | 'FREELANCER'
  | 'LEAD_GENERATOR';

export type PartnerRoleId =
  | 'tent'
  | 'catering'
  | 'venue'
  | 'photography'
  | 'event'
  | 'makeup'
  | 'mehendi'
  | 'pandit'
  | 'invitation'
  | 'gift'
  | 'jewellery'
  | 'fabricator'
  | 'clothing'
  | 'freelancer'
  | 'lead';

export type PartnerRoleFamily =
  | 'coreBooking'
  | 'soloService'
  | 'retailReferral'
  | 'specialistSupply'
  | 'growth';

export type PartnerMonetizationModel = 'commission' | 'subscription' | 'free';

export type PartnerServiceCode =
  | 'DECORATION'
  | 'CATERING'
  | 'VENUE'
  | 'PHOTOGRAPHY'
  | 'EVENT'
  | 'MAKEUP'
  | 'MEHENDI'
  | 'PANDIT'
  | 'INVITATION'
  | 'GIFT'
  | 'JEWELLERY'
  | 'FABRICATION'
  | 'CLOTHING';

export type PartnerCapability =
  | 'packages'
  | 'services'
  | 'inventory'
  | 'assignments'
  | 'newBookings'
  | 'earnings'
  | 'partnerWallet'
  | 'ranking'
  | 'qr'
  | 'qrAnalytics'
  | 'referrals'
  | 'tokenBooking'
  | 'collectAdvance'
  | 'bookingTracking'
  | 'subscription'
  | 'homeVisit'
  | 'franchise'
  | 'acceptedPaymentPolicies'
  | 'trustedWorker'
  | 'teamHire'
  | 'fabricatorTools'
  | 'menuManagement'
  | 'venueShowcase';

export type PartnerHomeTabId =
  | 'home'
  | 'bookings'
  | 'catalog'
  | 'growth'
  | 'profile'
  | 'subscription';

export type DashboardCardId =
  | 'packages'
  | 'book-for-client'
  | 'services'
  | 'inventory'
  | 'assignments'
  | 'new-bookings'
  | 'earnings'
  | 'partner-wallet'
  | 'ranking'
  | 'qr-code'
  | 'qr-analytics'
  | 'onboarded-partners'
  | 'token-booking'
  | 'booking-tracking'
  | 'home-visit'
  | 'franchise'
  | 'accepted-payment-policies'
  | 'menu-management'
  | 'venue-showcase';

export type SidebarItemId =
  | 'dashboard'
  | 'packages'
  | 'services'
  | 'inventory'
  | 'assignments'
  | 'new-bookings'
  | 'earnings'
  | 'partner-wallet'
  | 'ranking'
  | 'onboarded-partners'
  | 'qr-code'
  | 'qr-analytics'
  | 'token-booking'
  | 'booking-tracking'
  | 'home-visit'
  | 'franchise'
  | 'profile'
  | 'menu-management'
  | 'venue-showcase'
  | 'logout';

type ProgramEligibility = {
  homeVisit: boolean;
  franchise: boolean;
};

export interface PartnerRoleDefinition {
  code: PartnerRoleCode;
  id: PartnerRoleId;
  displayName: string;
  family: PartnerRoleFamily;
  monetizationModel: PartnerMonetizationModel;
  trainingId: PartnerRoleId;
  serviceCode: PartnerServiceCode | null;
  capabilities: PartnerCapability[];
  tabs: PartnerHomeTabId[];
  dashboardCards: DashboardCardId[];
  sidebarItems: SidebarItemId[];
  programs: ProgramEligibility;
}

export interface PartnerCapabilityManifest {
  activeRoleCode: PartnerRoleCode | null;
  activeRoleId: PartnerRoleId;
  activeRoleLabel: string;
  family: PartnerRoleFamily;
  monetizationModel: PartnerMonetizationModel;
  trainingId: PartnerRoleId;
  serviceCode: PartnerServiceCode | null;
  assignedRoleCodes: PartnerRoleCode[];
  assignedRoleIds: PartnerRoleId[];
  capabilities: PartnerCapability[];
  tabs: PartnerHomeTabId[];
  dashboardCards: DashboardCardId[];
  sidebarItems: SidebarItemId[];
  programs: ProgramEligibility;
}

const CORE_BOOKING_TABS: PartnerHomeTabId[] = ['home', 'bookings', 'catalog', 'growth', 'profile'];
const SOLO_SERVICE_TABS: PartnerHomeTabId[] = ['home', 'bookings', 'catalog', 'growth', 'subscription', 'profile'];
const RETAIL_TABS: PartnerHomeTabId[] = ['home', 'catalog', 'growth', 'profile'];
const SPECIALIST_TABS: PartnerHomeTabId[] = ['home', 'catalog', 'bookings', 'profile'];

const CORE_BOOKING_SIDEBAR: SidebarItemId[] = [
  'dashboard',
  'packages',
  'services',
  'inventory',
  'assignments',
  'earnings',
  'ranking',
  'onboarded-partners',
  'qr-code',
  'qr-analytics',
  'home-visit',
  'franchise',
  'profile',
  'logout',
];

const SOLO_SERVICE_SIDEBAR: SidebarItemId[] = [
  'dashboard',
  'services',
  'token-booking',
  'ranking',
  'earnings',
  'onboarded-partners',
  'qr-code',
  'qr-analytics',
  'profile',
  'logout',
];

const RETAIL_SIDEBAR: SidebarItemId[] = [
  'dashboard',
  'services',
  'token-booking',
  'earnings',
  'onboarded-partners',
  'qr-code',
  'qr-analytics',
  'profile',
  'logout',
];

const SPECIALIST_SIDEBAR: SidebarItemId[] = [
  'dashboard',
  'services',
  'inventory',
  'assignments',
  'ranking',
  'profile',
  'logout',
];

const ROLE_DEFINITIONS: Record<PartnerRoleCode, PartnerRoleDefinition> = {
  TENT_PARTNER: {
    code: 'TENT_PARTNER',
    id: 'tent',
    displayName: 'Tent Partner',
    family: 'coreBooking',
    monetizationModel: 'commission',
    trainingId: 'tent',
    serviceCode: 'DECORATION',
    capabilities: [
      'packages',
      'services',
      'inventory',
      'assignments',
      'newBookings',
      'earnings',
      'ranking',
      'qr',
      'qrAnalytics',
      'referrals',
      'tokenBooking',
      'collectAdvance',
      'homeVisit',
      'franchise',
      'acceptedPaymentPolicies',
      'trustedWorker',
    ],
    tabs: CORE_BOOKING_TABS,
    dashboardCards: [
      'packages',
      'book-for-client',
      'services',
      'inventory',
      'assignments',
      'earnings',
      'ranking',
      'qr-code',
      'qr-analytics',
      'onboarded-partners',
      'home-visit',
      'franchise',
      'accepted-payment-policies',
    ],
    sidebarItems: CORE_BOOKING_SIDEBAR,
    programs: { homeVisit: true, franchise: true },
  },
  CATERING_PARTNER: {
    code: 'CATERING_PARTNER',
    id: 'catering',
    displayName: 'Catering Partner',
    family: 'coreBooking',
    monetizationModel: 'commission',
    trainingId: 'catering',
    serviceCode: 'CATERING',
    capabilities: [
      'packages',
      'services',
      'menuManagement',
      'inventory',
      'assignments',
      'newBookings',
      'earnings',
      'ranking',
      'qr',
      'qrAnalytics',
      'referrals',
      'tokenBooking',
      'collectAdvance',
      'homeVisit',
      'franchise',
      'acceptedPaymentPolicies',
      'trustedWorker',
    ],
    tabs: CORE_BOOKING_TABS,
    dashboardCards: [
      'packages',
      'book-for-client',
      'services',
      'menu-management',
      'inventory',
      'assignments',
      'earnings',
      'ranking',
      'qr-code',
      'qr-analytics',
      'onboarded-partners',
      'home-visit',
      'franchise',
      'accepted-payment-policies',
    ],
    sidebarItems: [...CORE_BOOKING_SIDEBAR.slice(0, 3), 'menu-management', ...CORE_BOOKING_SIDEBAR.slice(3)],
    programs: { homeVisit: true, franchise: true },
  },
  VENUE_PARTNER: {
    code: 'VENUE_PARTNER',
    id: 'venue',
    displayName: 'Venue Partner',
    family: 'coreBooking',
    monetizationModel: 'commission',
    trainingId: 'venue',
    serviceCode: 'VENUE',
    capabilities: [
      'packages',
      'services',
      'assignments',
      'newBookings',
      'earnings',
      'ranking',
      'qr',
      'qrAnalytics',
      'referrals',
      'tokenBooking',
      'collectAdvance',
      'venueShowcase',
    ],
    tabs: CORE_BOOKING_TABS,
    dashboardCards: [
      'packages',
      'book-for-client',
      'services',
      'venue-showcase',
      'assignments',
      'earnings',
      'ranking',
      'qr-code',
      'qr-analytics',
      'onboarded-partners',
    ],
    sidebarItems: [
      ...CORE_BOOKING_SIDEBAR.filter((item) => !['inventory', 'home-visit', 'franchise'].includes(item)).slice(0, 3),
      'venue-showcase',
      ...CORE_BOOKING_SIDEBAR.filter((item) => !['inventory', 'home-visit', 'franchise'].includes(item)).slice(3),
    ],
    programs: { homeVisit: false, franchise: false },
  },
  PHOTOGRAPHY_PARTNER: {
    code: 'PHOTOGRAPHY_PARTNER',
    id: 'photography',
    displayName: 'Photography Partner',
    family: 'coreBooking',
    monetizationModel: 'commission',
    trainingId: 'photography',
    serviceCode: 'PHOTOGRAPHY',
    capabilities: [
      'packages',
      'services',
      'assignments',
      'newBookings',
      'earnings',
      'ranking',
      'qr',
      'qrAnalytics',
      'referrals',
      'tokenBooking',
      'collectAdvance',
      'homeVisit',
      'acceptedPaymentPolicies',
      'trustedWorker',
      'teamHire',
    ],
    tabs: CORE_BOOKING_TABS,
    dashboardCards: [
      'packages',
      'book-for-client',
      'services',
      'assignments',
      'earnings',
      'ranking',
      'qr-code',
      'qr-analytics',
      'onboarded-partners',
      'home-visit',
      'accepted-payment-policies',
    ],
    sidebarItems: CORE_BOOKING_SIDEBAR.filter((item) => !['inventory', 'franchise'].includes(item)),
    programs: { homeVisit: true, franchise: false },
  },
  EVENT_MANAGER: {
    code: 'EVENT_MANAGER',
    id: 'event',
    displayName: 'Event Manager',
    family: 'coreBooking',
    monetizationModel: 'commission',
    trainingId: 'event',
    serviceCode: 'EVENT',
    capabilities: [
      'packages',
      'services',
      'assignments',
      'newBookings',
      'earnings',
      'ranking',
      'qr',
      'qrAnalytics',
      'referrals',
      'tokenBooking',
      'collectAdvance',
      'homeVisit',
      'acceptedPaymentPolicies',
      'teamHire',
    ],
    tabs: CORE_BOOKING_TABS,
    dashboardCards: [
      'packages',
      'book-for-client',
      'services',
      'assignments',
      'earnings',
      'ranking',
      'qr-code',
      'qr-analytics',
      'onboarded-partners',
      'home-visit',
      'accepted-payment-policies',
    ],
    sidebarItems: CORE_BOOKING_SIDEBAR.filter((item) => !['inventory', 'franchise'].includes(item)),
    programs: { homeVisit: true, franchise: false },
  },
  MAKEUP_ARTIST: {
    code: 'MAKEUP_ARTIST',
    id: 'makeup',
    displayName: 'Makeup Artist',
    family: 'soloService',
    monetizationModel: 'subscription',
    trainingId: 'makeup',
    serviceCode: 'MAKEUP',
    capabilities: ['services', 'newBookings', 'earnings', 'ranking', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking', 'subscription'],
    tabs: SOLO_SERVICE_TABS,
    dashboardCards: ['services', 'ranking', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: SOLO_SERVICE_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  MEHNDI_ARTIST: {
    code: 'MEHNDI_ARTIST',
    id: 'mehendi',
    displayName: 'Mehndi Artist',
    family: 'soloService',
    monetizationModel: 'subscription',
    trainingId: 'mehendi',
    serviceCode: 'MEHENDI',
    capabilities: ['services', 'newBookings', 'earnings', 'ranking', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking', 'subscription'],
    tabs: SOLO_SERVICE_TABS,
    dashboardCards: ['services', 'ranking', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: SOLO_SERVICE_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  PANDIT_JI: {
    code: 'PANDIT_JI',
    id: 'pandit',
    displayName: 'Pandit Ji',
    family: 'soloService',
    monetizationModel: 'subscription',
    trainingId: 'pandit',
    serviceCode: 'PANDIT',
    capabilities: ['services', 'newBookings', 'earnings', 'ranking', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking', 'subscription'],
    tabs: SOLO_SERVICE_TABS,
    dashboardCards: ['services', 'ranking', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: SOLO_SERVICE_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  INVITATION_CARD: {
    code: 'INVITATION_CARD',
    id: 'invitation',
    displayName: 'Invitation Card Partner',
    family: 'retailReferral',
    monetizationModel: 'subscription',
    trainingId: 'invitation',
    serviceCode: 'INVITATION',
    capabilities: ['services', 'earnings', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking', 'subscription'],
    tabs: RETAIL_TABS,
    dashboardCards: ['services', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: RETAIL_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  GIFT_PARTNER: {
    code: 'GIFT_PARTNER',
    id: 'gift',
    displayName: 'Gift Partner',
    family: 'specialistSupply',
    monetizationModel: 'free',
    trainingId: 'gift',
    serviceCode: 'GIFT',
    capabilities: ['services', 'assignments', 'ranking'],
    tabs: SPECIALIST_TABS,
    dashboardCards: ['services', 'assignments', 'ranking'],
    sidebarItems: SPECIALIST_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  JEWELLERS_PARTNER: {
    code: 'JEWELLERS_PARTNER',
    id: 'jewellery',
    displayName: 'Jewellery Partner',
    family: 'retailReferral',
    monetizationModel: 'commission',
    trainingId: 'jewellery',
    serviceCode: 'JEWELLERY',
    capabilities: ['services', 'earnings', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking'],
    tabs: RETAIL_TABS,
    dashboardCards: ['services', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: RETAIL_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  TENT_FABRICATOR: {
    code: 'TENT_FABRICATOR',
    id: 'fabricator',
    displayName: 'Tent Fabricator',
    family: 'specialistSupply',
    monetizationModel: 'subscription',
    trainingId: 'fabricator',
    serviceCode: 'FABRICATION',
    capabilities: ['services', 'inventory', 'assignments', 'qr', 'qrAnalytics', 'fabricatorTools', 'subscription'],
    tabs: SPECIALIST_TABS,
    dashboardCards: ['services', 'inventory', 'assignments', 'qr-code', 'qr-analytics'],
    sidebarItems: SPECIALIST_SIDEBAR.filter((item) => item !== 'ranking'),
    programs: { homeVisit: false, franchise: false },
  },
  CLOTHING_PARTNER: {
    code: 'CLOTHING_PARTNER',
    id: 'clothing',
    displayName: 'Clothing Partner',
    family: 'retailReferral',
    monetizationModel: 'commission',
    trainingId: 'clothing',
    serviceCode: 'CLOTHING',
    capabilities: ['services', 'earnings', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking'],
    tabs: RETAIL_TABS,
    dashboardCards: ['services', 'earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: RETAIL_SIDEBAR,
    programs: { homeVisit: false, franchise: false },
  },
  FREELANCER: {
    code: 'FREELANCER',
    id: 'freelancer',
    displayName: 'Freelancer',
    family: 'specialistSupply',
    monetizationModel: 'subscription',
    trainingId: 'freelancer',
    serviceCode: null,
    capabilities: ['assignments', 'ranking', 'subscription'],
    tabs: ['home', 'bookings', 'subscription', 'profile'],
    dashboardCards: ['assignments', 'ranking'],
    sidebarItems: ['dashboard', 'assignments', 'ranking', 'profile', 'logout'],
    programs: { homeVisit: false, franchise: false },
  },
  LEAD_GENERATOR: {
    code: 'LEAD_GENERATOR',
    id: 'lead',
    displayName: 'Lead Generator',
    family: 'growth',
    monetizationModel: 'commission',
    trainingId: 'lead',
    serviceCode: null,
    capabilities: ['earnings', 'qr', 'qrAnalytics', 'referrals', 'tokenBooking'],
    tabs: RETAIL_TABS,
    dashboardCards: ['earnings', 'qr-code', 'qr-analytics', 'onboarded-partners'],
    sidebarItems: ['dashboard', 'token-booking', 'earnings', 'onboarded-partners', 'qr-code', 'qr-analytics', 'profile', 'logout'],
    programs: { homeVisit: false, franchise: false },
  },
};

const ROLE_CODE_ALIASES: Record<string, PartnerRoleCode> = {
  TENT_PARTNER: 'TENT_PARTNER',
  tent: 'TENT_PARTNER',
  CATERING_PARTNER: 'CATERING_PARTNER',
  catering: 'CATERING_PARTNER',
  VENUE_PARTNER: 'VENUE_PARTNER',
  venue: 'VENUE_PARTNER',
  PHOTOGRAPHY_PARTNER: 'PHOTOGRAPHY_PARTNER',
  photography: 'PHOTOGRAPHY_PARTNER',
  EVENT_MANAGER: 'EVENT_MANAGER',
  event: 'EVENT_MANAGER',
  MAKEUP_ARTIST: 'MAKEUP_ARTIST',
  makeup: 'MAKEUP_ARTIST',
  MEHNDI_ARTIST: 'MEHNDI_ARTIST',
  mehendi: 'MEHNDI_ARTIST',
  mehndi: 'MEHNDI_ARTIST',
  PANDIT_JI: 'PANDIT_JI',
  pandit: 'PANDIT_JI',
  INVITATION_CARD: 'INVITATION_CARD',
  invitation: 'INVITATION_CARD',
  GIFT_PARTNER: 'GIFT_PARTNER',
  gift: 'GIFT_PARTNER',
  JEWELLERS_PARTNER: 'JEWELLERS_PARTNER',
  jewellers: 'JEWELLERS_PARTNER',
  jewellery: 'JEWELLERS_PARTNER',
  TENT_FABRICATOR: 'TENT_FABRICATOR',
  fabricator: 'TENT_FABRICATOR',
  CLOTHING_PARTNER: 'CLOTHING_PARTNER',
  clothing: 'CLOTHING_PARTNER',
  FREELANCER: 'FREELANCER',
  freelancer: 'FREELANCER',
  LEAD_GENERATOR: 'LEAD_GENERATOR',
  lead: 'LEAD_GENERATOR',
};

const FALLBACK_ROLE_CODE: PartnerRoleCode = 'TENT_PARTNER';

const HOME_VISIT_PROGRAM_CARDS: DashboardCardId[] = ['home-visit'];
const FRANCHISE_PROGRAM_CARDS: DashboardCardId[] = ['franchise'];
const HOME_VISIT_PROGRAM_SIDEBAR: SidebarItemId[] = ['home-visit'];
const FRANCHISE_PROGRAM_SIDEBAR: SidebarItemId[] = ['franchise'];

const applyProgramVisibility = (definition: PartnerRoleDefinition): PartnerRoleDefinition => {
  const hiddenCards: DashboardCardId[] = [];
  const hiddenSidebar: SidebarItemId[] = [];
  const hiddenCapabilities: PartnerCapability[] = [];

  if (!definition.programs.homeVisit) {
    hiddenCards.push(...HOME_VISIT_PROGRAM_CARDS);
    hiddenSidebar.push(...HOME_VISIT_PROGRAM_SIDEBAR);
    hiddenCapabilities.push('homeVisit');
  }

  if (!definition.programs.franchise) {
    hiddenCards.push(...FRANCHISE_PROGRAM_CARDS);
    hiddenSidebar.push(...FRANCHISE_PROGRAM_SIDEBAR);
    hiddenCapabilities.push('franchise');
  }

  return {
    ...definition,
    capabilities: definition.capabilities.filter((capability) => !hiddenCapabilities.includes(capability)),
    dashboardCards: definition.dashboardCards.filter((cardId) => !hiddenCards.includes(cardId)),
    sidebarItems: definition.sidebarItems.filter((itemId) => !hiddenSidebar.includes(itemId)),
  };
};

const withPartnerWalletCard = (cards: DashboardCardId[]): DashboardCardId[] =>
  cards.includes('partner-wallet') ? cards : [...cards, 'partner-wallet'];

const withPartnerWalletSidebar = (items: SidebarItemId[]): SidebarItemId[] => {
  if (items.includes('partner-wallet')) {
    return items;
  }
  const profileIndex = items.indexOf('profile');
  const insertAt = profileIndex >= 0 ? profileIndex : items.length;
  return [...items.slice(0, insertAt), 'partner-wallet', ...items.slice(insertAt)];
};

const withPartnerWalletCapability = (capabilities: PartnerCapability[]): PartnerCapability[] =>
  capabilities.includes('partnerWallet') ? capabilities : [...capabilities, 'partnerWallet'];

export const ALL_PARTNER_ROLE_DEFINITIONS = Object.values(ROLE_DEFINITIONS);

export const normalizePartnerRoleCode = (input?: string | null): PartnerRoleCode | null => {
  if (!input) {
    return null;
  }

  const trimmed = input.trim();
  const directMatch = ROLE_CODE_ALIASES[trimmed];
  if (directMatch) {
    return directMatch;
  }

  const displayNameMatch = ALL_PARTNER_ROLE_DEFINITIONS.find(
    (role) => role.displayName.toLowerCase() === trimmed.toLowerCase()
  );
  if (displayNameMatch) {
    return displayNameMatch.code;
  }

  const normalized = trimmed.replace(/\s+/g, '_');
  return ROLE_CODE_ALIASES[normalized] ?? ROLE_CODE_ALIASES[normalized.toUpperCase()] ?? ROLE_CODE_ALIASES[normalized.toLowerCase()] ?? null;
};

export const dedupePartnerRoleCodes = (roleCodes: Array<string | null | undefined>): PartnerRoleCode[] => {
  const unique = new Set<PartnerRoleCode>();
  for (const roleCode of roleCodes) {
    const normalized = normalizePartnerRoleCode(roleCode);
    if (normalized) {
      unique.add(normalized);
    }
  }
  return Array.from(unique);
};

export const getPartnerRoleDefinition = (input?: string | null): PartnerRoleDefinition => {
  const normalizedCode = normalizePartnerRoleCode(input) ?? FALLBACK_ROLE_CODE;
  return ROLE_DEFINITIONS[normalizedCode];
};

/** Core booking roles that select UPFRONT / PAY_AS_GROW onboarding model. */
export const isCoreBookingPartnerType = (code: string): boolean =>
  getPartnerRoleDefinition(code).family === 'coreBooking';

export const getCanonicalPartnerRoleCode = (input?: string | null): PartnerRoleCode | null => {
  return normalizePartnerRoleCode(input);
};

export const getPartnerRoleId = (input?: string | null): PartnerRoleId => {
  return getPartnerRoleDefinition(input).id;
};

export const getPartnerRoleDisplayName = (input?: string | null): string => {
  return getPartnerRoleDefinition(input).displayName;
};

export const getTrainingRoleId = (input?: string | null): PartnerRoleId => {
  return getPartnerRoleDefinition(input).trainingId;
};

export const getServiceCodeForRole = (input?: string | null): PartnerServiceCode | null => {
  return getPartnerRoleDefinition(input).serviceCode;
};

export const roleHasCapability = (input: string | null | undefined, capability: PartnerCapability): boolean => {
  if (capability === 'partnerWallet') {
    return true;
  }
  return getPartnerRoleDefinition(input).capabilities.includes(capability);
};

export const isProgramEnabledForRole = (
  input: string | null | undefined,
  program: keyof ProgramEligibility
): boolean => {
  return getPartnerRoleDefinition(input).programs[program];
};

const PAYMENT_POLICY_PICKER_ROLE_CODES: PartnerRoleCode[] = [
  'TENT_PARTNER',
  'CATERING_PARTNER',
  'PHOTOGRAPHY_PARTNER',
  'EVENT_MANAGER',
];

export const isAcceptedPaymentPolicyPickerEnabled = (
  input?: string | null
): boolean => {
  const code = normalizePartnerRoleCode(input);
  return code != null && PAYMENT_POLICY_PICKER_ROLE_CODES.includes(code);
};

export const resolveActivePartnerRoleCode = (
  storedActiveRole: string | null | undefined,
  assignedRoles: Array<string | null | undefined>
): PartnerRoleCode => {
  const assignedRoleCodes = dedupePartnerRoleCodes(assignedRoles);
  const stored = normalizePartnerRoleCode(storedActiveRole);

  if (stored && (assignedRoleCodes.length === 0 || assignedRoleCodes.includes(stored))) {
    return stored;
  }

  return assignedRoleCodes[0] ?? stored ?? FALLBACK_ROLE_CODE;
};

export const buildPartnerCapabilityManifest = (
  activeRoleInput?: string | null,
  assignedRoleInputs: Array<string | null | undefined> = []
): PartnerCapabilityManifest => {
  const assignedRoleCodes = dedupePartnerRoleCodes(
    assignedRoleInputs.length > 0 ? assignedRoleInputs : [activeRoleInput]
  );
  const activeRoleCode = resolveActivePartnerRoleCode(activeRoleInput, assignedRoleCodes);
  const definition = applyProgramVisibility(getPartnerRoleDefinition(activeRoleCode));

  return {
    activeRoleCode,
    activeRoleId: definition.id,
    activeRoleLabel: definition.displayName,
    family: definition.family,
    monetizationModel: definition.monetizationModel,
    trainingId: definition.trainingId,
    serviceCode: definition.serviceCode,
    assignedRoleCodes,
    assignedRoleIds: assignedRoleCodes.map((roleCode) => ROLE_DEFINITIONS[roleCode].id),
    capabilities: withPartnerWalletCapability(definition.capabilities),
    tabs: definition.tabs,
    dashboardCards: withPartnerWalletCard(definition.dashboardCards),
    sidebarItems: withPartnerWalletSidebar(definition.sidebarItems),
    programs: definition.programs,
  };
};
