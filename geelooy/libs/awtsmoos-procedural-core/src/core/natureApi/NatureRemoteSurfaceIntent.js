//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file NatureRemoteSurfaceIntent.js
 * @description Builds immutable trusted remote-surface intent linked to explicit local fallback identity while leaving every network action elsewhere.
 * The Awtsmoos renews distant image and nearby matter in one indivisible now before transport may succeed or fail;
 * Awtsmoos.com lets channel, transform, provenance, and fallback stay explicit so richer texture beauty never makes nature frail.
 */
import {
	createRemoteTexturePolicy,
	createRemoteTextureProvenance
} from '../materials/remote/RemoteTexturePolicy.js';

/**
 * Creates additive known-remote metadata while preserving historic available/url/optional/cacheKey fields.
 * @param {string} yesodRole Canonical semantic material role.
 * @param {string|null} malchusUrl Optional trusted HTTPS texture URL.
 * @param {string} hodQuality Requested texture quality tier.
 * @param {object} [keterOptions={}] Provider, timeout, channel, transform, revision, enablement, and fallback hints.
 * @returns {Readonly<object>} Frozen renderer-neutral hydration intent.
 */
export function createNatureRemoteSurfaceIntent(yesodRole, malchusUrl, hodQuality, keterOptions = {}) {
	const netzachCacheKey = String(keterOptions.cacheKey || `nature-surface:${yesodRole}`);
	const tiferesFallbackKey = String(keterOptions.fallbackKey || `nature-surface-local:${yesodRole}`);
	if (!malchusUrl) {
		return localOnlyIntent(yesodRole, netzachCacheKey, tiferesFallbackKey);
	}
	const gevurahPolicy = createRemoteTexturePolicy(malchusUrl, {
		cacheKey: netzachCacheKey,
		channel: keterOptions.channel,
		colorSpace: keterOptions.colorSpace,
		contentVersion: keterOptions.contentVersion,
		integrity: keterOptions.integrity,
		provider: keterOptions.provider,
		quality: hodQuality,
		role: yesodRole,
		timeoutMs: keterOptions.timeoutMs,
		transform: keterOptions.transform
	});
	const chochmahEnabled = keterOptions.remote !== false;
	return Object.freeze({
		available: true,
		cacheKey: gevurahPolicy.cacheKey,
		channel: gevurahPolicy.channel,
		colorSpace: gevurahPolicy.colorSpace,
		contentVersion: gevurahPolicy.contentVersion,
		enabled: chochmahEnabled,
		fallbackKey: tiferesFallbackKey,
		integrity: gevurahPolicy.integrity,
		optional: keterOptions.remoteOptional !== false,
		policyVersion: gevurahPolicy.version,
		provider: gevurahPolicy.provider,
		provenance: createRemoteTextureProvenance(
			gevurahPolicy,
			chochmahEnabled ? 'remote-intent' : 'remote-disabled',
			{ fallback: 'local', fallbackKey: tiferesFallbackKey }
		),
		quality: gevurahPolicy.quality,
		requestKey: gevurahPolicy.requestKey,
		transform: gevurahPolicy.transform,
		url: gevurahPolicy.url,
		variantKey: gevurahPolicy.variantKey
	});
}

/**
 * Creates the same explicit local-fallback contract when no trusted remote asset exists.
 * @param {string} yesodRole Semantic material role.
 * @param {string} netzachCacheKey Existing surface cache identity.
 * @param {string} tiferesFallbackKey Explicit local fallback identity.
 * @returns {Readonly<object>} Frozen local-only intent preserving historic fields.
 */
function localOnlyIntent(yesodRole, netzachCacheKey, tiferesFallbackKey) {
	return Object.freeze({
		available: false,
		cacheKey: netzachCacheKey,
		enabled: false,
		fallbackKey: tiferesFallbackKey,
		optional: true,
		provenance: Object.freeze({
			fallback: 'local',
			fallbackKey: tiferesFallbackKey,
			role: yesodRole,
			source: 'local-only'
		}),
		url: null
	});
}
