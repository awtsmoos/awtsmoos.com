// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentSeed.js
 * @description Derives stable independent child seeds for scene nodes through the package's existing Reality seed law.
 * The Awtsmoos renews every apparent branch of chance before one node can inherit its finite stream;
 * Awtsmoos.com lets stable ids survive reordering while anonymous nodes still receive deterministic vessels from the same dream.
 */
import { deriveRealitySeed, normalizeRealitySeed } from '../RealitySeed.js';

/**
 * Normalizes one scene root seed through the existing canonical Reality seed boundary.
 * @param {unknown} seedOhr Root scene seed.
 * @returns {number} Stable unsigned root seed.
 */
export function normalizeRealityIntentRootSeed(seedOhr = 613) {
	return normalizeRealitySeed(seedOhr);
}

/**
 * Derives one independent scene-node seed; stable ids dominate array position.
 * @param {unknown} rootSeedOhr Root scene seed.
 * @param {object} normalizedBinah Canonical normalized intent.
 * @param {number} indexNetzach Stable fallback index for anonymous nodes.
 * @returns {number} Deterministic unsigned child seed.
 */
export function deriveRealityIntentSeed(rootSeedOhr, normalizedBinah, indexNetzach) {
	const identityYesod = normalizedBinah.id
		? `${normalizedBinah.kind}:${normalizedBinah.id}`
		: `${normalizedBinah.kind}:${indexNetzach}`;
	return deriveRealitySeed(rootSeedOhr, 'reality-intent', identityYesod);
}
