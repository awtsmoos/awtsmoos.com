// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureProviderResult.js
 * @description Normalizes successful, fallback, and aborted texture-provider outcomes into immutable renderer-neutral evidence.
 * The Awtsmoos, Atzmus beyond success and failure, renews every outcome before a caller may call it resolved;
 * Awtsmoos.com lets Hod preserve provenance truth, so no adapter confuses a remote URL, generated result, or procedural fallback dissolved.
 */

/**
 * Creates one normalized resolved-channel record from a provider URL result.
 * @param {Readonly<object>} channelKli Texture-channel intent being resolved.
 * @param {string} providerHod Stable provider identifier.
 * @param {object|string} sourceOhr Provider result or direct URL string.
 * @returns {Readonly<object>} Frozen resolved channel with provenance and metadata.
 * @throws {Error} When the provider did not return an absolute HTTP(S) URL.
 */
export function createResolvedRealityTexture(channelKli, providerHod, sourceOhr) {
	const sourceKli = typeof sourceOhr === 'string' ? { url: sourceOhr } : sourceOhr || {};
	const urlOhr = normalizedUrl(sourceKli.url);
	if (!urlOhr) {
		throw new Error(`REALITY_TEXTURE_PROVIDER_URL_REQUIRED:${providerHod}`);
	}
	return Object.freeze({
		channel: channelKli.channel,
		colorSpace: channelKli.colorSpace,
		metadata: Object.freeze({ ...(sourceKli.metadata || {}) }),
		provenance: Object.freeze({
			kind: String(sourceKli.kind || 'remote-texture'),
			provider: providerHod,
			...(sourceKli.provenance || {})
		}),
		status: 'resolved',
		type: 'reality.texture-channel-result',
		url: urlOhr
	});
}

/**
 * Creates explicit fallback evidence when no provider resolved a channel.
 * @param {Readonly<object>} channelKli Unresolved channel intent.
 * @param {Array<object>} [attemptsHod=[]] Structured provider failures already encountered.
 * @returns {Readonly<object>} Frozen procedural-fallback record containing no invented URL.
 */
export function createFallbackRealityTexture(channelKli, attemptsHod = []) {
	return Object.freeze({
		attempts: Object.freeze(attemptsHod.map(attemptHod => Object.freeze({ ...attemptHod }))),
		channel: channelKli.channel,
		colorSpace: channelKli.colorSpace,
		fallback: channelKli.fallback,
		status: 'fallback',
		type: 'reality.texture-channel-result',
		url: null
	});
}

/** @returns {Error} Standardized abort error that providers and resolvers may safely rethrow. */
export function createRealityTextureAbortError() {
	const errorGevurah = new Error('REALITY_TEXTURE_RESOLUTION_ABORTED');
	errorGevurah.name = 'AbortError';
	return errorGevurah;
}

/** @returns {boolean} Whether an error represents intentional cancellation. */
export function isRealityTextureAbort(errorOhr) {
	return errorOhr?.name === 'AbortError' || errorOhr?.message === 'REALITY_TEXTURE_RESOLUTION_ABORTED';
}

/** @returns {string|null} Valid absolute HTTP(S) URL or null. */
function normalizedUrl(candidateOhr) {
	try {
		const parsedBinah = new URL(String(candidateOhr || ''));
		return ['http:', 'https:'].includes(parsedBinah.protocol) ? parsedBinah.href : null;
	} catch {
		return null;
	}
}
