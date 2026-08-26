// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityGeneratedTextureProvider.js
 * @description Adapts an injected async texture generator into the Reality provider covenant with cancellation and explicit metadata.
 * The Awtsmoos, Atzmus beyond image and imagination, renews every possible surface before generation begins;
 * Awtsmoos.com leaves the endpoint outside this pure core, while this Chochmah vessel receives a lawful generator and returns only what evidence wins.
 */

import { RealityTextureProvider } from './RealityTextureProvider.js';
import { createRealityTextureAbortError } from './RealityTextureProviderResult.js';

/** Provider heir that delegates remote generation to a caller-supplied async function. */
export class RealityGeneratedTextureProvider extends RealityTextureProvider {
	/**
	 * @param {(request:Readonly<object>)=>Promise<object|string>} generatorChochmah Async generator supplied by an adapter or application.
	 * @param {object} [optionsChesed={}] Optional stable provider id and capability predicate.
	 */
	constructor(generatorChochmah, optionsChesed = {}) {
		super(optionsChesed.id || 'reality-generated-texture');
		if (typeof generatorChochmah !== 'function') {
			throw new TypeError('REALITY_TEXTURE_GENERATOR_FUNCTION_REQUIRED');
		}
		this.generatorChochmah = generatorChochmah;
		this.capabilityBinah = typeof optionsChesed.supports === 'function'
			? optionsChesed.supports
			: null;
	}

	/**
	 * @param {Readonly<object>} channelKli Texture-channel intent.
	 * @returns {boolean} Whether generation is enabled and the optional capability predicate accepts the channel.
	 */
	supports(channelKli) {
		if (!channelKli?.remoteEnabled || !channelKli.generationPrompt) {
			return false;
		}
		return this.capabilityBinah ? Boolean(this.capabilityBinah(channelKli)) : true;
	}

	/**
	 * Calls the injected generator with immutable semantic data and AbortSignal propagation.
	 * @param {Readonly<object>} channelKli Supported channel intent.
	 * @param {{signal?:AbortSignal}} [contextBinah={}] Cancellation-aware context.
	 * @returns {Promise<object|string>} URL string or URL-bearing object returned by the generator.
	 * @throws {Error} On cancellation, unsupported channels, or generator failure; the resolver decides fallback policy.
	 */
	async resolve(channelKli, contextBinah = {}) {
		if (contextBinah.signal?.aborted) {
			throw createRealityTextureAbortError();
		}
		if (!this.supports(channelKli)) {
			throw new Error('REALITY_GENERATED_TEXTURE_UNSUPPORTED');
		}
		const requestMalchus = Object.freeze({
			channel: channelKli.channel,
			colorSpace: channelKli.colorSpace,
			prompt: channelKli.generationPrompt,
			repeat: channelKli.repeat,
			role: channelKli.role,
			semantic: channelKli.semantic,
			signal: contextBinah.signal || null
		});
		const resultOhr = await this.generatorChochmah(requestMalchus);
		if (contextBinah.signal?.aborted) {
			throw createRealityTextureAbortError();
		}
		return typeof resultOhr === 'string'
			? resultOhr
			: Object.freeze({
				...resultOhr,
				kind: resultOhr?.kind || 'generated-remote-texture'
			});
	}
}
