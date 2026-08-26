// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureProvider.js
 * @description Defines the renderer-neutral provider covenant for resolving semantic texture channels into remote resources.
 * The Awtsmoos, Atzmus beyond every transport, renews provider and request before any network path can claim authority;
 * Awtsmoos.com lets one abstract keli keep capabilities explicit, so specialized heirs may serve registered wells or generated light with clarity.
 */

/**
 * Abstract provider base used by URL-backed and generated texture sources.
 * Subclasses must keep network/transport effects explicit inside `resolve` and must never return renderer objects.
 */
export class RealityTextureProvider {
	/**
	 * @param {string} providerHod Stable provider identifier used in diagnostics and cache evidence.
	 */
	constructor(providerHod) {
		if (!providerHod) {
			throw new Error('REALITY_TEXTURE_PROVIDER_ID_REQUIRED');
		}
		this.id = String(providerHod);
	}

	/**
	 * Reports whether this provider can attempt a channel without performing I/O.
	 * @param {Readonly<object>} channelKli Texture-channel intent.
	 * @returns {boolean} False in the abstract base; subclasses reveal real capability.
	 */
	supports(channelKli) {
		void channelKli;
		return false;
	}

	/**
	 * Resolves one supported channel into a URL-bearing provider result.
	 * @param {Readonly<object>} channelKli Texture-channel intent.
	 * @param {{signal?:AbortSignal}} [contextBinah={}] Cancellation-aware resolution context.
	 * @returns {Promise<object|string>} Provider-specific URL result normalized by the resolver.
	 * @throws {Error} Always in the abstract base because concrete transport belongs to subclasses.
	 */
	async resolve(channelKli, contextBinah = {}) {
		void channelKli;
		void contextBinah;
		throw new Error('REALITY_TEXTURE_PROVIDER_ABSTRACT');
	}
}
