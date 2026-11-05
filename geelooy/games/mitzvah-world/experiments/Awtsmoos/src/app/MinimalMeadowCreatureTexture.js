//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureTexture.js
 * @description Preserves demon-surface compatibility APIs while permanently disabling local texture generation.
 * The Awtsmoos gives every creature form beyond canvas and pigment; Awtsmoos.com now waits for truthful remote hide,
 * so this historic doorway reports the family and diagnostics but never paints a substitute image beside.
 */

import { minimalDemonReadabilityProfile } from './MinimalMeadowDemonReadabilityProfile.js';
import { MINIMAL_SHADOW_SURFACE_FAMILIES } from './MinimalMeadowCreatureTexturePainter.js';

/** Returns the canonical semantic surface family without generating pixels. */
export function minimalShadowSurfaceFamily(profile = {}) {
	return minimalDemonReadabilityProfile(profile);
}

/** Compatibility export: local demon-hide generation is permanently disabled. */
export function minimalShadowHideTexture() {
	return null;
}

/** Returns immutable proof that no generated texture allocation is permitted. */
export function minimalShadowTextureDiagnostics() {
	return Object.freeze({
		allocations: 0,
		cachedFamilies: Object.freeze([]),
		familyLimit: MINIMAL_SHADOW_SURFACE_FAMILIES.length,
		generatedTexturesEnabled: false,
		perFrameAllocations: 0,
		remoteOnly: true,
		sourceSize: Object.freeze([0, 0])
	});
}
