export type PartnerRoleCode = 'TENT_PARTNER' | 'CATERING_PARTNER' | 'VENUE_PARTNER' | 'PHOTOGRAPHY_PARTNER' | 'EVENT_MANAGER' | 'MAKEUP_ARTIST' | 'MEHNDI_ARTIST' | 'PANDIT_JI' | 'INVITATION_CARD' | 'GIFT_PARTNER' | 'JEWELLERS_PARTNER' | 'TENT_FABRICATOR' | 'CLOTHING_PARTNER' | 'FREELANCER' | 'LEAD_GENERATOR';
export type PartnerRoleId = 'tent' | 'catering' | 'venue' | 'photography' | 'event' | 'makeup' | 'mehendi' | 'pandit' | 'invitation' | 'gift' | 'jewellery' | 'fabricator' | 'clothing' | 'freelancer' | 'lead';
export type PartnerRoleFamily = 'coreBooking' | 'soloService' | 'retailReferral' | 'specialistSupply' | 'growth';
export type PartnerMonetizationModel = 'commission' | 'subscription' | 'free';
export type PartnerServiceCode = 'DECORATION' | 'CATERING' | 'VENUE' | 'PHOTOGRAPHY' | 'EVENT' | 'MAKEUP' | 'MEHENDI' | 'PANDIT' | 'INVITATION' | 'GIFT' | 'JEWELLERY' | 'FABRICATION' | 'CLOTHING';
export type PartnerCapability = 'packages' | 'services' | 'inventory' | 'assignments' | 'newBookings' | 'earnings' | 'partnerWallet' | 'ranking' | 'qr' | 'qrAnalytics' | 'referrals' | 'tokenBooking' | 'collectAdvance' | 'bookingTracking' | 'subscription' | 'homeVisit' | 'franchise' | 'acceptedPaymentPolicies' | 'trustedWorker' | 'teamHire' | 'fabricatorTools' | 'menuManagement' | 'venueShowcase';
export type PartnerHomeTabId = 'home' | 'bookings' | 'catalog' | 'growth' | 'profile' | 'subscription';
export type DashboardCardId = 'packages' | 'book-for-client' | 'services' | 'inventory' | 'assignments' | 'new-bookings' | 'earnings' | 'partner-wallet' | 'ranking' | 'qr-code' | 'qr-analytics' | 'onboarded-partners' | 'token-booking' | 'booking-tracking' | 'home-visit' | 'franchise' | 'accepted-payment-policies' | 'menu-management' | 'venue-showcase';
export type SidebarItemId = 'dashboard' | 'packages' | 'services' | 'inventory' | 'assignments' | 'new-bookings' | 'earnings' | 'partner-wallet' | 'ranking' | 'onboarded-partners' | 'qr-code' | 'qr-analytics' | 'token-booking' | 'booking-tracking' | 'home-visit' | 'franchise' | 'profile' | 'menu-management' | 'venue-showcase' | 'logout';
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
export declare const ALL_PARTNER_ROLE_DEFINITIONS: PartnerRoleDefinition[];
export declare const normalizePartnerRoleCode: (input?: string | null) => PartnerRoleCode | null;
export declare const dedupePartnerRoleCodes: (roleCodes: Array<string | null | undefined>) => PartnerRoleCode[];
export declare const getPartnerRoleDefinition: (input?: string | null) => PartnerRoleDefinition;
/** Core booking roles that select UPFRONT / PAY_AS_GROW onboarding model. */
export declare const isCoreBookingPartnerType: (code: string) => boolean;
export declare const getCanonicalPartnerRoleCode: (input?: string | null) => PartnerRoleCode | null;
export declare const getPartnerRoleId: (input?: string | null) => PartnerRoleId;
export declare const getPartnerRoleDisplayName: (input?: string | null) => string;
export declare const getTrainingRoleId: (input?: string | null) => PartnerRoleId;
export declare const getServiceCodeForRole: (input?: string | null) => PartnerServiceCode | null;
export declare const roleHasCapability: (input: string | null | undefined, capability: PartnerCapability) => boolean;
export declare const isProgramEnabledForRole: (input: string | null | undefined, program: keyof ProgramEligibility) => boolean;
export declare const isAcceptedPaymentPolicyPickerEnabled: (input?: string | null) => boolean;
export declare const resolveActivePartnerRoleCode: (storedActiveRole: string | null | undefined, assignedRoles: Array<string | null | undefined>) => PartnerRoleCode;
export declare const buildPartnerCapabilityManifest: (activeRoleInput?: string | null, assignedRoleInputs?: Array<string | null | undefined>) => PartnerCapabilityManifest;
export {};
