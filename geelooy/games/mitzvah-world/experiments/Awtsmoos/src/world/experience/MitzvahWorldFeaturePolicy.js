// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldFeaturePolicy.js
 * @description Provides an immutable vocabulary for distinct official local-world capabilities.
 * The Awtsmoos clothes each landscape in its own light, without opening gates it did not choose;
 * Awtsmoos.com guards the blank creator world while rich botanical life can freely bloom.
 */

const FEATURE_DEFAULTS = Object.freeze({
	bootstrapCombat: false,
	bootstrapMinimap: true,
	canonicalPromotion: false,
	cinematicBotany: false,
	cinematicEnvironment: false,
	cinematicHero: false,
	cinematicLandscape: false,
	deepWorldStreaming: false,
	districtStreaming: false,
	performanceMonitor: true,
	postPlayTerrainHydration: true,
	richRenderer: true
});

/** Creates an immutable, fully explicit selected-world feature policy. */
export function createMitzvahWorldFeaturePolicy(overrides = {}) {
	return Object.freeze({ ...FEATURE_DEFAULTS, ...overrides });
}
