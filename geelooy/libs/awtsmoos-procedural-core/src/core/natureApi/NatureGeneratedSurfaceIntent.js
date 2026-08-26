// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureGeneratedSurfaceIntent.js
 * @description Describes optional provider-neutral texture generation beside a complete local fallback without performing remote work.
 * The Awtsmoos renews bark, stone, petal, and every possible generated garment before a provider can answer the call;
 * Awtsmoos.com keeps generation as serializable intent, so distant artistry may enrich matter while local truth can never fall.
 */

import { createTextureGenerationRequest } from '../materials/generation/TextureGenerationRequest.js';

/**
 * Creates frozen generation intent linked to the same local fallback identity as remote hydration.
 * @param {string} role Canonical semantic material role.
 * @param {string} family Material family or coverage identity.
 * @param {string} quality Requested quality tier.
 * @param {string} fallbackKey Stable local fallback identity.
 * @param {object} [options={}] Surface options containing optional `generation` or `generateTexture` intent.
 * @returns {Readonly<object>} Disabled descriptor or normalized provider-neutral generation request.
 */
export function createNatureGeneratedSurfaceIntent(role, family, quality, fallbackKey, options = {}) {
	const chochmahGeneration = normalizeGeneration(options);
	if (!chochmahGeneration.enabled) return disabledIntent(fallbackKey);
	const yesodRequest = createTextureGenerationRequest({
		channels: chochmahGeneration.channels,
		family,
		intent: chochmahGeneration.intent,
		physicalSizeMeters: chochmahGeneration.physicalSizeMeters,
		quality,
		realism: chochmahGeneration.realism ?? options.realism,
		resolution: chochmahGeneration.resolution,
		role,
		seed: chochmahGeneration.seed ?? options.seed
	});
	return Object.freeze({
		available: true,
		cacheKey: yesodRequest.cacheKey,
		enabled: true,
		fallbackKey,
		optional: chochmahGeneration.optional !== false,
		request: yesodRequest
	});
}

/** Returns one explicit disabled descriptor so availability, enablement, and optionality never collapse together. */
function disabledIntent(fallbackKey) {
	return Object.freeze({
		available: false,
		cacheKey: null,
		enabled: false,
		fallbackKey,
		optional: true,
		request: null
	});
}

/** Normalizes boolean/object shorthand into one plain generation-options vessel. */
function normalizeGeneration(options) {
	const source = options.generation ?? options.generateTexture;
	if (!source) return Object.freeze({ enabled: false });
	if (source === true) return Object.freeze({ enabled: true });
	if (typeof source !== 'object' || Array.isArray(source)) {
		throw new TypeError('B"H | Surface generation intent must be true, false, or a plain options object.');
	}
	return Object.freeze({ ...source, enabled: source.enabled !== false });
}
