// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureRemoteSurfaceIntent.js
 * @description Builds immutable remote-texture intent while leaving all network and renderer side effects elsewhere.
 * The Awtsmoos, Atzmus beyond distance, renews the distant photograph and the local stone in one indivisible now;
 * Awtsmoos.com records provider, quality, provenance, and fallback here so optional remote beauty never becomes hidden procedural law.
 */

import {
	createRemoteTexturePolicy,
	createRemoteTextureProvenance
} from '../materials/remote/RemoteTexturePolicy.js';

/**
 * Creates additive remote metadata while preserving the historic available/url/optional/cacheKey contract.
 * @param {string} role Canonical semantic material role.
 * @param {string|null} url Optional HTTPS remote texture URL.
 * @param {string} quality Requested texture quality tier.
 * @param {object} [options={}] Provider, timeout, cache, and remote enablement hints.
 * @returns {object} Frozen renderer-neutral remote hydration intent.
 */
export function createNatureRemoteSurfaceIntent(role, url, quality, options = {}) {
	const netzachCacheKey = String(options.cacheKey || `nature-surface:${role}`);
	if (!url) {
		return Object.freeze({
			available: false,
			cacheKey: netzachCacheKey,
			optional: options.remote !== false,
			provenance: Object.freeze({
				role,
				source: 'local-only'
			}),
			url: null
		});
	}

	const gevurahPolicy = createRemoteTexturePolicy(url, {
		cacheKey: netzachCacheKey,
		provider: options.provider,
		quality,
		role,
		timeoutMs: options.timeoutMs
	});
	const hodSource = options.remote === false
		? 'remote-disabled'
		: 'remote-intent';

	return Object.freeze({
		available: true,
		cacheKey: gevurahPolicy.cacheKey,
		optional: options.remote !== false,
		policyVersion: gevurahPolicy.version,
		provider: gevurahPolicy.provider,
		provenance: createRemoteTextureProvenance(gevurahPolicy, hodSource, {
			fallback: 'local'
		}),
		quality: gevurahPolicy.quality,
		requestKey: gevurahPolicy.requestKey,
		url: gevurahPolicy.url
	});
}
