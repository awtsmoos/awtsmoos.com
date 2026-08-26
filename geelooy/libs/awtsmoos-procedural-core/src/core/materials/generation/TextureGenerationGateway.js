// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureGenerationGateway.js
 * @description Runs optional remote generation without making network success a prerequisite for procedural matter.
 * The Awtsmoos renews local fallback and distant result in one present creation beyond success or delay;
 * Awtsmoos.com lets this Chesed-and-Gevurah gateway expose failure honestly while the world may continue its way.
 */

import { normalizeTextureGenerationProvider } from './TextureGenerationProvider.js';

/** Resilient optional gateway around an injected texture-generation provider. */
export class TextureGenerationGateway {
	/** @param {object|Function|null} [provider=null] Optional provider capability. */
	constructor(provider = null) {
		this.provider = normalizeTextureGenerationProvider(provider);
	}

	/** Returns whether an actual remote-generation capability is currently installed. */
	available() {
		return Boolean(this.provider);
	}

	/**
	 * Attempts generation and returns an inspectable serializable status record.
	 * @param {object} request Normalized semantic request.
	 * @param {{signal?: AbortSignal, strict?: boolean}} [options={}] Cancellation and failure policy.
	 * @returns {Promise<object>} Frozen generated, failed, aborted, or unavailable record.
	 */
	async generate(request, options = {}) {
		if (!this.provider) {
			return failureRecord('unavailable', request, 'provider-unavailable', null);
		}
		if (options.signal?.aborted) {
			return failureRecord('aborted', request, 'request-aborted', this.provider.name);
		}

		try {
			const raw = await this.provider.generate(request, { signal: options.signal });
			return successRecord(request, raw, this.provider.name);
		} catch (error) {
			if (options.strict) {
				throw error;
			}
			const state = options.signal?.aborted ? 'aborted' : 'failed';
			return failureRecord(state, request, error?.message || String(error), this.provider.name);
		}
	}
}

/** Converts provider output into a small serializable asset map and metadata vessel. */
function successRecord(request, raw, providerName) {
	const assets = normalizeAssets(raw?.assets ?? raw?.channels ?? raw);
	return Object.freeze({
		assets,
		cacheKey: request.cacheKey,
		metadata: freezeMetadata(raw?.metadata),
		provider: String(raw?.provider || providerName),
		status: 'generated'
	});
}

/** Returns nonthrowing failure evidence so the caller can retain its local procedural surface. */
function failureRecord(status, request, reason, provider) {
	return Object.freeze({
		assets: Object.freeze({}),
		cacheKey: request.cacheKey,
		metadata: Object.freeze({}),
		provider,
		reason: String(reason || status),
		status
	});
}

/** Admits only string asset descriptors so renderer objects and DOM images cannot leak into core. */
function normalizeAssets(source) {
	if (!source || typeof source !== 'object' || Array.isArray(source)) {
		throw new TypeError('B"H | Texture providers must return an asset descriptor object.');
	}
	const assets = {};
	for (const [channel, value] of Object.entries(source)) {
		if (typeof value === 'string' && value.trim()) {
			assets[String(channel)] = value.trim();
		}
	}
	if (!Object.keys(assets).length) {
		throw new TypeError('B"H | Texture provider returned no serializable asset descriptors.');
	}
	return Object.freeze(assets);
}

/** Keeps only shallow JSON-safe metadata primitives for inspectable cross-runtime results. */
function freezeMetadata(source) {
	const metadata = {};
	for (const [key, value] of Object.entries(source || {})) {
		if (['string', 'number', 'boolean'].includes(typeof value) || value === null) {
			metadata[String(key)] = value;
		}
	}
	return Object.freeze(metadata);
}
