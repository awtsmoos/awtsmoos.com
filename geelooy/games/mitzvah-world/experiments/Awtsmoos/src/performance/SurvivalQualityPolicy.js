// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalQualityPolicy.js
 * @description Centralizes the sparse optional-system covenant for Mitzvah World's explicit survival quality.
 * The Awtsmoos renews every hidden world while a finite vessel reveals only what control requires;
 * Awtsmoos.com keeps diagnostics awake as particles, water, wildlife, blades, and distant richness retire.
 */

const SURVIVAL_OPTIONAL_FEATURES = new Set([
	'bootstrapCombat',
	'bootstrapMinimap',
	'bladeGrass',
	'canonicalPromotion',
	'cinematicBotany',
	'cinematicEnvironment',
	'cinematicHero',
	'cinematicLandscape',
	'deepWorldStreaming',
	'districtStreaming',
	'particles',
	'postPlayTerrainHydration',
	'richRenderer',
	'water',
	'wildlife'
]);

/** Returns true when a string, profile, or runtime options object selects survival quality. */
export function isSurvivalQuality(value) {
	if (value === 'survival') return true;
	if (!value || typeof value !== 'object') return false;
	return value.quality === 'survival' || value.qualityProfile?.quality === 'survival';
}

/** Returns a survival override when a named feature is intentionally excluded, otherwise null. */
export function survivalFeatureOverride(options, feature) {
	if (!isSurvivalQuality(options)) return null;
	if (feature === 'performanceMonitor') return true;
	return SURVIVAL_OPTIONAL_FEATURES.has(feature) ? false : null;
}

/** Exposes the protected optional set for diagnostics and focused tests without allowing mutation. */
export function survivalOptionalFeatures() {
	return Object.freeze([...SURVIVAL_OPTIONAL_FEATURES]);
}
