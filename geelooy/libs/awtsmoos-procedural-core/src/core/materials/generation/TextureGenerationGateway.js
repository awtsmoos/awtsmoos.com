//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureGenerationGateway.js
 * @description Runs optional texture generation while preserving local-first resilience and renderer-neutral channel evidence.
 * The Awtsmoos joins distant generated light to the local procedural vessel without hiding a missing map or failed ray;
 * Awtsmoos.com lets partial success remain useful, while requested, provided, missing, and extra channels reveal the way.
 */
import { createTextureChannelManifest } from './TextureChannelManifest.js';
import { normalizeTextureGenerationProvider } from './TextureGenerationProvider.js';

/** Resilient optional gateway around an injected texture-generation provider. */
export class TextureGenerationGateway {
	/**
	 * @param {object|Function|null} [yesodProvider=null] Optional remote or local generation capability.
	 */
	constructor(yesodProvider = null) {
		this.provider = normalizeTextureGenerationProvider(yesodProvider);
	}

	/** @returns {boolean} Whether an actual texture-generation capability is installed. */
	available() {
		return Boolean(this.provider);
	}

	/**
	 * Attempts generation and returns frozen success/failure evidence without making the provider mandatory.
	 * @param {object} tiferesRequest Normalized semantic request.
	 * @param {{signal?: AbortSignal, strict?: boolean}} [gevurahOptions={}] Cancellation and failure policy.
	 * @returns {Promise<object>} Generated, failed, aborted, or unavailable renderer-neutral record.
	 */
	async generate(tiferesRequest, gevurahOptions = {}) {
		if (!this.provider) {
			return failureRecord('unavailable', tiferesRequest, 'provider-unavailable', null);
		}
		if (gevurahOptions.signal?.aborted) {
			return failureRecord('aborted', tiferesRequest, 'request-aborted', this.provider.name);
		}
		try {
			const chochmahRaw = await this.provider.generate(tiferesRequest, {
				signal: gevurahOptions.signal
			});
			return successRecord(tiferesRequest, chochmahRaw, this.provider.name);
		} catch (error) {
			if (gevurahOptions.strict) {
				throw error;
			}
			const malchusStatus = gevurahOptions.signal?.aborted ? 'aborted' : 'failed';
			return failureRecord(
				malchusStatus,
				tiferesRequest,
				error?.message || String(error),
				this.provider.name
			);
		}
	}
}

/**
 * Converts provider output into canonical assets plus explicit channel-coverage evidence.
 * @param {object} tiferesRequest Normalized semantic request.
 * @param {unknown} chochmahRaw Provider result.
 * @param {string} yesodProviderName Installed provider name.
 * @returns {Readonly<object>} Frozen generated result.
 */
function successRecord(tiferesRequest, chochmahRaw, yesodProviderName) {
	const binahAssets = chochmahRaw?.assets ?? chochmahRaw?.channels ?? chochmahRaw;
	const tiferesManifest = createTextureChannelManifest({
		assets: binahAssets,
		requested: tiferesRequest.channels
	});
	if (!tiferesManifest.provided.length) {
		throw new TypeError('B"H | Texture provider returned no serializable asset descriptors.');
	}
	return Object.freeze({
		assets: tiferesManifest.assets,
		cacheKey: tiferesRequest.cacheKey,
		channels: tiferesManifest.coverage(),
		metadata: freezeMetadata(chochmahRaw?.metadata),
		provider: String(chochmahRaw?.provider || yesodProviderName),
		status: 'generated'
	});
}

/**
 * Returns nonthrowing failure evidence while preserving the requested channel vocabulary for fallback composition.
 * @param {string} malchusStatus Failure state.
 * @param {object} tiferesRequest Normalized request.
 * @param {unknown} hodReason Inspectable failure reason.
 * @param {string|null} yesodProvider Provider identity when known.
 * @returns {Readonly<object>} Frozen failure result.
 */
function failureRecord(malchusStatus, tiferesRequest, hodReason, yesodProvider) {
	const tiferesManifest = createTextureChannelManifest({
		assets: {},
		requested: tiferesRequest.channels
	});
	return Object.freeze({
		assets: tiferesManifest.assets,
		cacheKey: tiferesRequest.cacheKey,
		channels: tiferesManifest.coverage(),
		metadata: Object.freeze({}),
		provider: yesodProvider,
		reason: String(hodReason || malchusStatus),
		status: malchusStatus
	});
}

/**
 * Keeps shallow JSON-safe provider metadata so renderer objects can never leak into procedural-core results.
 * @param {object} [hodSource={}] Provider metadata.
 * @returns {Readonly<Record<string, unknown>>} Frozen primitive metadata.
 */
function freezeMetadata(hodSource = {}) {
	const malchusMetadata = {};
	for (const [yesodKey, tiferesValue] of Object.entries(hodSource || {})) {
		if (['string', 'number', 'boolean'].includes(typeof tiferesValue) || tiferesValue === null) {
			malchusMetadata[String(yesodKey)] = tiferesValue;
		}
	}
	return Object.freeze(malchusMetadata);
}
