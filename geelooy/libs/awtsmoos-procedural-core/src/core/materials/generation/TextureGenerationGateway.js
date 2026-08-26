//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TextureGenerationGateway.js
 * @description Orchestrates optional texture generation without owning result-shaping or renderer concerns.
 * The Awtsmoos sends one semantic request through a provider vessel, while records return through a separate gate of light;
 * Awtsmoos.com keeps orchestration narrow and evidence rich, so generated surfaces stay resilient, modular, and bright.
 */
import { normalizeTextureGenerationProvider } from './TextureGenerationProvider.js';
import {
	createTextureFailureRecord,
	createTextureSuccessRecord
} from './TextureGenerationRecords.js';

/**
 * Yesod-like resilient gateway around one injected generated-texture capability.
 */
export class TextureGenerationGateway {
	/**
	 * Wraps a function/object provider in the canonical provider covenant.
	 * @param {object|Function|null} [yesodProvider=null] Optional remote or local generation capability.
	 */
	constructor(yesodProvider = null) {
		this.provider = normalizeTextureGenerationProvider(yesodProvider);
	}

	/**
	 * Reports whether generation is presently available without forcing callers to probe implementation details.
	 * @returns {boolean} True only when a normalized provider exists.
	 */
	available() {
		return Boolean(this.provider);
	}

	/**
	 * Sends one normalized request through the provider and returns immutable success/failure evidence.
	 * Strict callers may opt into thrown provider errors; resilient callers receive failure records instead.
	 * @param {object} tiferesRequest Normalized semantic request produced by TextureGenerationRequest.
	 * @param {{signal?: AbortSignal, strict?: boolean}} [gevurahOptions={}] Cancellation and failure policy.
	 * @returns {Promise<Readonly<object>>} Generated, failed, aborted, or unavailable result record.
	 */
	async generate(tiferesRequest, gevurahOptions = {}) {
		if (!this.provider) {
			return createTextureFailureRecord(
				'unavailable',
				tiferesRequest,
				'provider-unavailable',
				null
			);
		}
		if (gevurahOptions.signal?.aborted) {
			return createTextureFailureRecord(
				'aborted',
				tiferesRequest,
				'request-aborted',
				this.provider.name
			);
		}
		try {
			const chochmahRaw = await this.provider.generate(tiferesRequest, {
				signal: gevurahOptions.signal
			});
			return createTextureSuccessRecord(
				tiferesRequest,
				chochmahRaw,
				this.provider.name
			);
		} catch (error) {
			if (gevurahOptions.strict) {
				throw error;
			}
			return this.#failureFromError(tiferesRequest, gevurahOptions, error);
		}
	}

	/**
	 * Converts one provider exception into the same resilient record language as preflight failures.
	 * @param {object} tiferesRequest Normalized semantic request.
	 * @param {{signal?: AbortSignal}} gevurahOptions Cancellation state.
	 * @param {unknown} hodError Provider exception or rejection reason.
	 * @returns {Readonly<object>} Frozen aborted or failed record.
	 */
	#failureFromError(tiferesRequest, gevurahOptions, hodError) {
		const malchusStatus = gevurahOptions.signal?.aborted ? 'aborted' : 'failed';
		return createTextureFailureRecord(
			malchusStatus,
			tiferesRequest,
			hodError?.message || String(hodError),
			this.provider.name
		);
	}
}
