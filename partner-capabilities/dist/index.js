const CORE_BOOKING_TABS = ['home', 'bookings', 'catalog', 'growth', 'profile'];
const SOLO_SERVICE_TABS = ['home', 'bookings', 'catalog', 'growth', 'subscription', 'profile'];
const RETAIL_TABS = ['home', 'catalog', 'growth', 'profile'];
const SPECIALIST_TABS = ['home', 'catalog', 'bookings', 'profile'];
const CORE_BOOKING_SIDEBAR = [
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
const SOLO_SERVICE_SIDEBAR = [
    'dashboard',
    'services',
    'ranking',
    'earnings',
    'onboarded-partners',
    'qr-code',
    'qr-analytics',
    'profile',
    'logout',
];
const RETAIL_SIDEBAR = [
    'dashboard',
    'services',
    'earnings',
    'onboarded-partners',
    'qr-code',
    'qr-analytics',
    'profile',
    'logout',
];
const SPECIALIST_SIDEBAR = [
    'dashboard',
    'services',
    'inventory',
    'assignments',
    'ranking',
    'profile',
    'logout',
];
const ROLE_DEFINITIONS = {
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
            'book-for-client',
            'services',
            'venue-showcase',
            'assignments',
            'earnings',
            'ranking',
            'qr-code',
            'qr-analytics',
            'onboarded-partners',
            'accepted-payment-policies',
        ],
        sidebarItems: [
            ...CORE_BOOKING_SIDEBAR.filter((item) => !['packages', 'inventory', 'home-visit', 'franchise'].includes(item)).slice(0, 2),
            'venue-showcase',
            ...CORE_BOOKING_SIDEBAR.filter((item) => !['packages', 'inventory', 'home-visit', 'franchise'].includes(item)).slice(2),
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
        sidebarItems: ['dashboard', 'earnings', 'onboarded-partners', 'qr-code', 'qr-analytics', 'profile', 'logout'],
        programs: { homeVisit: false, franchise: false },
    },
};
const ROLE_CODE_ALIASES = {
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
const FALLBACK_ROLE_CODE = 'TENT_PARTNER';
const HOME_VISIT_PROGRAM_CARDS = ['home-visit'];
const FRANCHISE_PROGRAM_CARDS = ['franchise'];
const HOME_VISIT_PROGRAM_SIDEBAR = ['home-visit'];
const FRANCHISE_PROGRAM_SIDEBAR = ['franchise'];
const applyProgramVisibility = (definition) => {
    const hiddenCards = [];
    const hiddenSidebar = [];
    const hiddenCapabilities = [];
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
const withPartnerWalletCard = (cards) => cards.includes('partner-wallet') ? cards : [...cards, 'partner-wallet'];
const withPartnerWalletSidebar = (items) => {
    if (items.includes('partner-wallet')) {
        return items;
    }
    const profileIndex = items.indexOf('profile');
    const insertAt = profileIndex >= 0 ? profileIndex : items.length;
    return [...items.slice(0, insertAt), 'partner-wallet', ...items.slice(insertAt)];
};
const withPartnerWalletCapability = (capabilities) => capabilities.includes('partnerWallet') ? capabilities : [...capabilities, 'partnerWallet'];
export const ALL_PARTNER_ROLE_DEFINITIONS = Object.values(ROLE_DEFINITIONS);
export const normalizePartnerRoleCode = (input) => {
    var _a, _b, _c;
    if (!input) {
        return null;
    }
    const trimmed = input.trim();
    const directMatch = ROLE_CODE_ALIASES[trimmed];
    if (directMatch) {
        return directMatch;
    }
    const displayNameMatch = ALL_PARTNER_ROLE_DEFINITIONS.find((role) => role.displayName.toLowerCase() === trimmed.toLowerCase());
    if (displayNameMatch) {
        return displayNameMatch.code;
    }
    const normalized = trimmed.replace(/\s+/g, '_');
    return (_c = (_b = (_a = ROLE_CODE_ALIASES[normalized]) !== null && _a !== void 0 ? _a : ROLE_CODE_ALIASES[normalized.toUpperCase()]) !== null && _b !== void 0 ? _b : ROLE_CODE_ALIASES[normalized.toLowerCase()]) !== null && _c !== void 0 ? _c : null;
};
export const dedupePartnerRoleCodes = (roleCodes) => {
    const unique = new Set();
    for (const roleCode of roleCodes) {
        const normalized = normalizePartnerRoleCode(roleCode);
        if (normalized) {
            unique.add(normalized);
        }
    }
    return Array.from(unique);
};
export const getPartnerRoleDefinition = (input) => {
    var _a;
    const normalizedCode = (_a = normalizePartnerRoleCode(input)) !== null && _a !== void 0 ? _a : FALLBACK_ROLE_CODE;
    return ROLE_DEFINITIONS[normalizedCode];
};
/** Core booking roles that select UPFRONT / PAY_AS_GROW onboarding model. */
export const isCoreBookingPartnerType = (code) => getPartnerRoleDefinition(code).family === 'coreBooking';
export const getCanonicalPartnerRoleCode = (input) => {
    return normalizePartnerRoleCode(input);
};
export const getPartnerRoleId = (input) => {
    return getPartnerRoleDefinition(input).id;
};
export const getPartnerRoleDisplayName = (input) => {
    return getPartnerRoleDefinition(input).displayName;
};
export const getTrainingRoleId = (input) => {
    return getPartnerRoleDefinition(input).trainingId;
};
export const getServiceCodeForRole = (input) => {
    return getPartnerRoleDefinition(input).serviceCode;
};
export const roleHasCapability = (input, capability) => {
    if (capability === 'partnerWallet') {
        return true;
    }
    return getPartnerRoleDefinition(input).capabilities.includes(capability);
};
export const isProgramEnabledForRole = (input, program) => {
    return getPartnerRoleDefinition(input).programs[program];
};
const PAYMENT_POLICY_PICKER_ROLE_CODES = [
    'TENT_PARTNER',
    'CATERING_PARTNER',
    'PHOTOGRAPHY_PARTNER',
    'EVENT_MANAGER',
    'VENUE_PARTNER',
];
const SERVICE_PACKAGE_CATALOG_ROLE_CODES = [
    'TENT_PARTNER',
    'CATERING_PARTNER',
    'PHOTOGRAPHY_PARTNER',
    'EVENT_MANAGER',
];
export const isAcceptedPaymentPolicyPickerEnabled = (input) => {
    const code = normalizePartnerRoleCode(input);
    return code != null && PAYMENT_POLICY_PICKER_ROLE_CODES.includes(code);
};
export const isServicePackageCatalogEnabled = (input) => {
    const code = normalizePartnerRoleCode(input);
    return code != null && SERVICE_PACKAGE_CATALOG_ROLE_CODES.includes(code);
};
export const resolveActivePartnerRoleCode = (storedActiveRole, assignedRoles) => {
    var _a, _b;
    const assignedRoleCodes = dedupePartnerRoleCodes(assignedRoles);
    const stored = normalizePartnerRoleCode(storedActiveRole);
    if (stored && (assignedRoleCodes.length === 0 || assignedRoleCodes.includes(stored))) {
        return stored;
    }
    return (_b = (_a = assignedRoleCodes[0]) !== null && _a !== void 0 ? _a : stored) !== null && _b !== void 0 ? _b : FALLBACK_ROLE_CODE;
};
export const buildPartnerCapabilityManifest = (activeRoleInput, assignedRoleInputs = []) => {
    const assignedRoleCodes = dedupePartnerRoleCodes(assignedRoleInputs.length > 0 ? assignedRoleInputs : [activeRoleInput]);
    const activeRoleCode = resolveActivePartnerRoleCode(activeRoleInput, assignedRoleCodes);
    const definition = applyProgramVisibility(getPartnerRoleDefinition(activeRoleCode));
    const showPackageCatalog = isServicePackageCatalogEnabled(activeRoleCode);
    const dashboardCards = withPartnerWalletCard(definition.dashboardCards);
    const sidebarItems = withPartnerWalletSidebar(definition.sidebarItems);
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
        dashboardCards: showPackageCatalog
            ? dashboardCards
            : dashboardCards.filter((cardId) => cardId !== 'packages'),
        sidebarItems: showPackageCatalog
            ? sidebarItems
            : sidebarItems.filter((itemId) => itemId !== 'packages'),
        programs: definition.programs,
    };
};
