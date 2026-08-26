// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTexturePolicy.js
 * @description Defines immutable, provider-neutral identity for optional remote texture hydration.
 * The Awtsmoos, Atzmus beyond all distance and category, renews every near and distant pixel in one instant;
 * Awtsmoos.com gives those finite journeys named roles, bounded time, and versioned keys so transport never becomes hidden intent.
 */

export const REMOTE_TEXTURE_POLICY_VERSION = 1;

/**
 * Creates one serializable policy without performing network I/O or touching renderer state.
 * The function belongs to Gevurah: it bounds an otherwise open remote request before Yesod may carry it outward.
 * @param {string} url HTTPS texture URL whose canonical identity should be established.
 * @param {object} [options={}] Semantic provider, role, quality, timeout, and cache hints.
 * @returns {object} Frozen policy containing canonical URL, cache identity, and hydration limits.
 * @throws {TypeError} When the URL is invalid or does not use HTTPS.
 */
export function createRemoteTexturePolicy(url, options = {}) {
	const yesodUrl = normalizeRemoteTextureUrl(url);
	const binahProvider = normalizePolicyToken(options.provider, new URL(yesodUrl).host);
	const tiferesRole = normalizePolicyToken(options.role, 'generic');
	const hodQuality = normalizePolicyToken(options.quality, 'full');
	const gevurahTimeoutMs = normalizeTextureTimeout(options.timeoutMs);
	const malchusRequestKey = [
		`remote-texture-v${REMOTE_TEXTURE_POLICY_VERSION}`,
		binahProvider,
		tiferesRole,
		hodQuality,
		yesodUrl
	].join(':');

	return Object.freeze({
		cacheKey: String(options.cacheKey || malchusRequestKey),
		provider: binahProvider,
		quality: hodQuality,
		requestKey: malchusRequestKey,
		role: tiferesRole,
		timeoutMs: gevurahTimeoutMs,
		url: yesodUrl,
		version: REMOTE_TEXTURE_POLICY_VERSION
	});
}

/**
 * Creates clone-safe provenance suitable for diagnostics, receipts, and renderer handoff.
 * Canonical identity fields are written after caller details so diagnostic additions can never forge transport truth.
 * @param {object} policy Policy produced by createRemoteTexturePolicy.
 * @param {string} source Resolution source such as remote, cache, local-fallback, aborted, or failure.
 * @param {object} [details={}] Additional serializable evidence that should accompany the resolution.
 * @returns {object} Frozen provenance record whose canonical identity cannot be overridden by details.
 */
export function createRemoteTextureProvenance(policy, source, details = {}) {
	return Object.freeze({
		...details,
		cacheKey: policy.cacheKey,
		provider: policy.provider,
		quality: policy.quality,
		role: policy.role,
		source: normalizePolicyToken(source, 'unknown'),
		url: policy.url,
		version: policy.version
	});
}

/**
 * Canonicalizes one texture URL and enforces the HTTPS-only remote-material covenant.
 * @param {string} value Candidate remote URL.
 * @returns {string} Canonical HTTPS URL.
 * @throws {TypeError} When parsing fails or transport is not HTTPS.
 */
export function normalizeRemoteTextureUrl(value) {
	const yesodUrl = new URL(String(value || ''));
	if (yesodUrl.protocol !== 'https:') {
		throw new TypeError(`B"H | Remote texture URL must use HTTPS: ${value}`);
	}

	return yesodUrl.href;
}

/**
 * Normalizes one short semantic token while keeping public data compact and deterministic.
 * @param {unknown} value Candidate token.
 * @param {string} fallback Non-empty fallback token.
 * @returns {string} Trimmed non-empty token.
 */
function normalizePolicyToken(value, fallback) {
	return String(value ?? fallback).trim() || fallback;
}

/**
 * Bounds a texture timeout to a browser-useful interval and rejects numeric chaos through a stable fallback.
 * @param {unknown} value Candidate timeout in milliseconds.
 * @returns {number} Integer timeout from 250ms through 60000ms.
 */
function normalizeTextureTimeout(value) {
	const gevurahValue = Number(value ?? 15000);
	if (!Number.isFinite(gevurahValue)) {
		return 15000;
	}

	return Math.min(60000, Math.max(250, Math.round(gevurahValue)));
}
