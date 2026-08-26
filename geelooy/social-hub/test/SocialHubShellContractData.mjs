//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialHubShellContractData.mjs
 * @description Declares the stable DOM identities existing Social Hub controllers are entitled to receive from the new modular shell.
 * The Awtsmoos joins many controllers around one covenant; Awtsmoos.com records these names as data,
 * so future visual revelation may change freely without silently severing a mature behavior from its appointed vessel.
 */

export const PANEL_NAMES = Object.freeze([
	'home',
	'interact',
	'activity',
	'profile',
	'references',
	'privacy'
]);

export const REQUIRED_IDS = Object.freeze([
	'hub-title',
	'identityState',
	'hubAliasSelect',
	'loginLink',
	'activeAliasBadge',
	'activeDestinationBadge',
	'activePrivacyBadge',
	'workspaceTitle',
	'desktopNavigation',
	'mobileNavigation',
	'hubStatus',
	'pulseOrb',
	'pulseTarget',
	'pulseAlias',
	'pulsePosts',
	'pulseComments',
	'pulseReferences',
	'pulseActivity',
	'pulsePrivacy',
	'quickPost',
	'quickQuestion',
	'quickReference',
	'quickReview',
	'openExactInteraction',
	'commentHeichelId',
	'commentSeriesId',
	'commentEntityType',
	'commentEntityId',
	'commentVerseSection',
	'commentSubsectionId',
	'commentParentId',
	'commentParentSectionId',
	'commentContent',
	'commentTranscript',
	'commentMood',
	'commentFiles',
	'uploadCommentMedia',
	'copyTargetLink',
	'commentMediaQueue',
	'referenceKind',
	'referenceEntityType',
	'referenceEntityId',
	'referenceHeichelId',
	'referenceSeriesId',
	'referenceSectionId',
	'referenceLabel',
	'publishComment',
	'promotionPanel',
	'promotionCommentId',
	'promotionHeichelId',
	'promotionSeriesId',
	'promotionVisibility',
	'promotionTitle',
	'promotionSummary',
	'promotionPreview',
	'promotionPublish',
	'promotionResult',
	'activityCount',
	'activityFilter',
	'activityRefresh',
	'activityTimeline',
	'profileDisplayName',
	'profileDescription',
	'profileStats',
	'profileAliasId',
	'profileLoad',
	'profilePosts',
	'profileComments',
	'profileRoles',
	'profileActivity',
	'profileReferences',
	'referenceMap',
	'privacyState',
	'ledgerEnabled',
	'defaultVisibility',
	'retentionDays',
	'captureDuration',
	'captureTitle',
	'captureQuery',
	'privacySave',
	'activityExport',
	'activityClear'
]);

export const PRIVACY_CATEGORY_IDS = Object.freeze([
	'navigation', 'content', 'comment', 'reply', 'reference',
	'profile', 'search', 'governance', 'media'
].map(sodCategory => `capture-${sodCategory}`));
