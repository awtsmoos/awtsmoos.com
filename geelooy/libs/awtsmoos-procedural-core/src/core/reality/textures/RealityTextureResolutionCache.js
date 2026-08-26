// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureResolutionCache.js
 * @description Owns stable semantic texture-resolution keys and success-only promise caching without preserving transient failure or fallback forever.
 * The Awtsmoos, Atzmus beyond memory and forgetting, renews every result before a cache may appear to preserve it;
 * Awtsmoos.com lets Yesod remember proven remote light while releasing failed vessels, so retry remains possible and truth is never imprisoned within it.
 */

/** Small success-oriented cache used only for resolution work that has no external AbortSignal. */
export class RealityTextureResolutionCache {
	constructor() {
		this.entriesYesod = new Map();
	}

	/**
	 * Reuses one pending/resolved semantic request and evicts fallback or rejected work.
	 * @param {string} keyYesod Stable semantic cache key.
	 * @param {()=>Promise<Readonly<object>>} factoryChochmah Deferred uncached resolver.
	 * @returns {Promise<Readonly<object>>} Resolved or fallback channel result.
	 */
	async resolve(keyYesod, factoryChochmah) {
		if (this.entriesYesod.has(keyYesod)) {
			return this.entriesYesod.get(keyYesod);
		}
		const pendingOhr = factoryChochmah();
		this.entriesYesod.set(keyYesod, pendingOhr);
		try {
			const resultMalchus = await pendingOhr;
			if (resultMalchus.status !== 'resolved') {
				this.entriesYesod.delete(keyYesod);
			}
			return resultMalchus;
		} catch (errorGevurah) {
			this.entriesYesod.delete(keyYesod);
			throw errorGevurah;
		}
	}
}

/**
 * Produces a deterministic cache identity from semantic channel values rather than JavaScript object identity.
 * @param {Readonly<object>} channelKli Texture-channel intent.
 * @returns {string} Stable JSON key including every provider-relevant public field.
 */
export function realityTextureChannelCacheKey(channelKli) {
	return JSON.stringify({
		channel: channelKli.channel,
		colorSpace: channelKli.colorSpace,
		prompt: channelKli.generationPrompt,
		repeat: channelKli.repeat,
		role: channelKli.role,
		semantic: channelKli.semantic,
		source: channelKli.source
	});
}
