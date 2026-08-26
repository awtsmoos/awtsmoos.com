// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureResolver.js
 * @description Coordinates multi-channel texture resolution while focused collaborators own provider walking and success-only caching.
 * The Awtsmoos, Atzmus beyond cause and sequence, renews every channel before a set may gather their light;
 * Awtsmoos.com lets this Tiferes coordinator stay small while Netzach resolves providers and Yesod remembers only proven remote sight.
 */

import { RealityGeneratedTextureProvider } from './RealityGeneratedTextureProvider.js';
import { RealityRemoteTextureProvider } from './RealityRemoteTextureProvider.js';
import { RealityTextureChannelResolver } from './RealityTextureChannelResolver.js';
import { createRealityTextureAbortError } from './RealityTextureProviderResult.js';
import {
	RealityTextureResolutionCache,
	realityTextureChannelCacheKey
} from './RealityTextureResolutionCache.js';

/** Ordered renderer-neutral texture-set resolver with explicit provider composition and success-only caching. */
export class RealityTextureResolver {
	/**
	 * @param {object} [optionsChesed={}] Optional custom providers, generator function, generator options, and remote-URL toggle.
	 */
	constructor(optionsChesed = {}) {
		const providersMalchus = createProviders(optionsChesed);
		this.channelNetzach = new RealityTextureChannelResolver(providersMalchus);
		this.cacheYesod = new RealityTextureResolutionCache();
	}

	/**
	 * Resolves every declared channel concurrently while preserving per-channel provider priority.
	 * @param {Readonly<object>} textureSetKli Canonical `reality.texture-set-intent` contract.
	 * @param {{signal?:AbortSignal}} [contextBinah={}] Optional cancellation context.
	 * @returns {Promise<Readonly<object>>} Frozen resolved/fallback texture-set result.
	 */
	async resolve(textureSetKli, contextBinah = {}) {
		if (textureSetKli?.type !== 'reality.texture-set-intent') {
			throw new TypeError('REALITY_TEXTURE_SET_INTENT_REQUIRED');
		}
		if (contextBinah.signal?.aborted) {
			throw createRealityTextureAbortError();
		}
		const entriesMalchus = await Promise.all(
			Object.entries(textureSetKli.channels).map(async ([channelHod, channelKli]) => {
				return [channelHod, await this.resolveChannel(channelKli, contextBinah)];
			})
		);
		return Object.freeze({
			channels: Object.freeze(Object.fromEntries(entriesMalchus)),
			role: textureSetKli.role,
			semantic: textureSetKli.semantic,
			type: 'reality.texture-set-result'
		});
	}

	/**
	 * Resolves one channel, bypassing shared cache whenever an AbortSignal gives the request independent lifetime semantics.
	 * @param {Readonly<object>} channelKli Texture-channel intent.
	 * @param {{signal?:AbortSignal}} [contextBinah={}] Resolution context.
	 * @returns {Promise<Readonly<object>>} Resolved or fallback channel result.
	 */
	resolveChannel(channelKli, contextBinah = {}) {
		if (contextBinah.signal) {
			return this.channelNetzach.resolve(channelKli, contextBinah);
		}
		const keyYesod = realityTextureChannelCacheKey(channelKli);
		return this.cacheYesod.resolve(keyYesod, () => {
			return this.channelNetzach.resolve(channelKli, contextBinah);
		});
	}
}

/** @returns {Readonly<Array<object>>} Ordered providers with cheap URL resolution before custom/generated work. */
function createProviders(optionsChesed) {
	const providersMalchus = [];
	if (optionsChesed.includeRemote !== false) {
		providersMalchus.push(new RealityRemoteTextureProvider());
	}
	providersMalchus.push(...(Array.isArray(optionsChesed.providers) ? optionsChesed.providers : []));
	if (typeof optionsChesed.generator === 'function') {
		providersMalchus.push(new RealityGeneratedTextureProvider(
			optionsChesed.generator,
			optionsChesed.generatorOptions
		));
	}
	return Object.freeze(providersMalchus);
}
