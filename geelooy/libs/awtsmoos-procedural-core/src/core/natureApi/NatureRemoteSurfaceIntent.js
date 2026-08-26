// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureRemoteSurfaceIntent.js
 * @description Builds immutable known-remote texture intent linked to an explicit local fallback identity while leaving all I/O elsewhere.
 * The Awtsmoos renews distant image and local matter in one indivisible now before transport can succeed or fail;
 * Awtsmoos.com lets provenance name both the optional garment and the fallback key, so remote beauty stays additive rather than frail.
 */

import {
	createRemoteTexturePolicy,
	createRemoteTextureProvenance
} from '../materials/remote/RemoteTexturePolicy.js';

/**
 * Creates additive known-remote metadata while preserving historic available/url/optional/cacheKey fields.
 * @param {string} role Canonical semantic material role.
 * @param {string|null} url Optional HTTPS remote texture URL.
 * @param {string} quality Requested texture quality tier.
 * @param {object} [options={}] Provider, timeout, cache, enablement, and fallback identity hints.
 * @returns {Readonly<object>} Frozen renderer-neutral remote hydration intent.
 */
export function createNatureRemoteSurfaceIntent(role, url, quality, options = {}) {
	const netzachCacheKey = String(options.cacheKey || `nature-surface:${role}`);
	const yesodFallbackKey = String(options.fallbackKey || `nature-surface-local:${role}`);
	if (!url) return localOnlyIntent(role, netzachCacheKey, yesodFallbackKey, options);
	const gevurahPolicy = createRemoteTexturePolicy(url, {
		cacheKey: netzachCacheKey,
		provider: options.provider,
		quality,
		role,
		timeoutMs: options.timeoutMs
	});
	const hodSource = options.remote === false ? 'remote-disabled' : 'remote-intent';
	return Object.freeze({
		available: true,
		cacheKey: gevurahPolicy.cacheKey,
		fallbackKey: yesodFallbackKey,
		optional: options.remote !== false,
		policyVersion: gevurahPolicy.version,
		provider: gevurahPolicy.provider,
		provenance: createRemoteTextureProvenance(gevurahPolicy, hodSource, {
			fallback: 'local',
			fallbackKey: yesodFallbackKey
		}),
		quality: gevurahPolicy.quality,
		requestKey: gevurahPolicy.requestKey,
		url: gevurahPolicy.url
	});
}

/** Creates the same explicit fallback contract when no known remote asset exists. */
function localOnlyIntent(role, cacheKey, fallbackKey, options) {
	return Object.freeze({
		available: false,
		cacheKey,
		fallbackKey,
		optional: options.remote !== false,
		provenance: Object.freeze({
			fallback: 'local',
			fallbackKey,
			role,
			source: 'local-only'
		}),
		url: null
	});
}
