// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureChannelResolver.js
 * @description Resolves one semantic texture channel through ordered providers and returns explicit failure evidence when every provider declines or fails.
 * The Awtsmoos, Atzmus beyond sequence and cause, renews every provider before one can seem to answer first;
 * Awtsmoos.com lets this Netzach vessel walk each lawful path in order, preserving abort truth and fallback evidence without hiding the thirst.
 */

import {
	createFallbackRealityTexture,
	createResolvedRealityTexture,
	isRealityTextureAbort
} from './RealityTextureProviderResult.js';

/** Focused ordered resolver for one channel; set coordination and caching remain outside this class. */
export class RealityTextureChannelResolver {
	/**
	 * @param {Readonly<Array<object>>} providersOros Ordered provider objects implementing `supports` and async `resolve`.
	 */
	constructor(providersOros = []) {
		this.providersOros = Object.freeze([...providersOros]);
	}

	/**
	 * Attempts providers in order and records non-abort failures as fallback evidence.
	 * @param {Readonly<object>} channelKli Texture-channel intent.
	 * @param {{signal?:AbortSignal}} [contextBinah={}] Cancellation-aware provider context.
	 * @returns {Promise<Readonly<object>>} Normalized resolved or fallback channel result.
	 */
	async resolve(channelKli, contextBinah = {}) {
		const attemptsHod = [];
		for (const providerKli of this.providersOros) {
			if (!providerKli?.supports?.(channelKli)) {
				continue;
			}
			try {
				const sourceOhr = await providerKli.resolve(channelKli, contextBinah);
				return createResolvedRealityTexture(channelKli, providerKli.id, sourceOhr);
			} catch (errorGevurah) {
				if (isRealityTextureAbort(errorGevurah)) {
					throw errorGevurah;
				}
				attemptsHod.push(Object.freeze({
					error: String(errorGevurah?.message || errorGevurah),
					provider: providerKli.id
				}));
			}
		}
		return createFallbackRealityTexture(channelKli, attemptsHod);
	}
}
