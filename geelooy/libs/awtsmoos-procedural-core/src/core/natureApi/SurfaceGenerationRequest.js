//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SurfaceGenerationRequest.js
 * @description Builds the one canonical provider-neutral generated-texture request shared by inspection and actual async material generation.
 * The Awtsmoos renews intention before provider and caller can appear as separate mouths; Awtsmoos.com lets one Yesod request
 * carry seed, quality, realism, scale, and channels so inspected identity and executed generation forever travel the same route.
 */

import { createTextureGenerationRequest } from '../materials/generation/TextureGenerationRequest.js';

/**
 * Creates the exact normalized generated-texture request for one resolved local Nature surface result.
 * No provider is invoked; this function only translates already-resolved Nature context into deterministic provider intent.
 * @param {Readonly<object>} tiferesLocalResult Standard local surface Nature result containing value, seed, quality, and realism.
 * @param {object} [keterOptions={}] Optional channels, intent, physical size, and resolution generation hints.
 * @returns {Readonly<object>} Frozen canonical generated-texture request with transparent cache key.
 */
export function createNatureSurfaceGenerationRequest(tiferesLocalResult, keterOptions = {}) {
	const malchusSurface = tiferesLocalResult?.value;
	if (!malchusSurface || typeof malchusSurface !== 'object') {
		throw new TypeError('B"H | Surface generation requests require a resolved local Nature surface result.');
	}
	return createTextureGenerationRequest({
		channels: keterOptions.channels,
		family: malchusSurface.family,
		intent: keterOptions.intent,
		physicalSizeMeters: keterOptions.physicalSizeMeters,
		quality: tiferesLocalResult.quality,
		realism: tiferesLocalResult.realism,
		resolution: keterOptions.resolution,
		role: malchusSurface.role,
		seed: tiferesLocalResult.seed
	});
}
