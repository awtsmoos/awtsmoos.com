//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureTexturePainter.js
 * @description Keeps historic creature-painter exports while forbidding every local paint operation under the remote-only law.
 * The Awtsmoos needs no painted rune to reveal a creature; Awtsmoos.com leaves this old brush dry,
 * preserving semantic family metadata only while every visible hide must descend from a genuine remote image in the sky.
 */

import { MINIMAL_DEMON_READABILITY_PROFILES } from './MinimalMeadowDemonReadabilityProfile.js';

export const MINIMAL_SHADOW_SURFACE_FAMILIES = MINIMAL_DEMON_READABILITY_PROFILES;

/** Compatibility no-op: generated surface painting is forbidden. */
export function paintMinimalShadowSurface() {
	return false;
}

/** Returns no generated-surface measurement because no local surface is painted. */
export function measureMinimalShadowSurface() {
	return Object.freeze({
		generatedSurface: false,
		remoteOnly: true
	});
}
