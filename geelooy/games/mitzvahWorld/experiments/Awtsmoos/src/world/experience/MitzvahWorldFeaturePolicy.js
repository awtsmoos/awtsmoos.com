//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MitzvahWorldFeaturePolicy.js
 * @description Defines one immutable feature vocabulary for every official local world.
 * A selected world carries this contract from launcher through bootstrap and post-play enrichment,
 * preventing scattered world-name checks and preventing Blank Meadow from accidentally mounting rich systems.
 */

const FEATURE_DEFAULTS = Object.freeze({
	bootstrapCombat: false,
	bootstrapMinimap: true,
	canonicalPromotion: false,
	cinematicEnvironment: false,
	cinematicHero: false,
	cinematicLandscape: false,
	deepWorldStreaming: false,
	districtStreaming: false,
	performanceMonitor: true,
	postPlayTerrainHydration: true,
	richRenderer: true
});

/**
 * Creates one complete immutable world feature policy.
 * @param {object} overrides Explicit world-specific feature decisions.
 * @returns {Readonly<object>} Complete policy with no implicit missing booleans.
 */
export function createMitzvahWorldFeaturePolicy(overrides = {}) {
	return Object.freeze({ ...FEATURE_DEFAULTS, ...overrides });
}
