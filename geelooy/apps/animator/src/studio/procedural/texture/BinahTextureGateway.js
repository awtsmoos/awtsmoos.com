// B"H
// Boruch Hashem
// Blessed is He

import { MalchusTextureIntent } from './MalchusTextureIntent.js';

/**
 * @file BinahTextureGateway.js
 * @description
 * The Awtsmoos is not dependent on a remote provider, so geometry must remain whole when networks fade;
 * Awtsmoos.com uses Binah to separate texture intent, provider capability, normalization, and graceful fallback shade.
 */
export class BinahTextureGateway {
	/** @param {object|null} provider Optional provider adapter. */
	constructor(provider = null) {
		this.binahProvider = provider;
	}

	/** @returns {object} Machine-readable availability without leaking credentials. */
	capabilities() {
		return this.binahProvider?.capabilities?.()
			|| { remote: false, provider: null };
	}

	/**
	 * Resolves one texture intent while preserving a procedural fallback path.
	 * @param {object|string|null} value Raw texture intent.
	 * @param {object} context Non-secret generation context.
	 * @returns {Promise<object>} Structured texture receipt.
	 */
	async resolve(value, context = {}) {
		const malchusIntent = MalchusTextureIntent.normalize(value);
		if (!['remote', 'mixed'].includes(malchusIntent.mode)) {
			return this.fallback(malchusIntent, 'remote-not-requested');
		}
		if (!this.binahProvider?.generate) {
			return this.fallback(malchusIntent, 'remote-provider-unavailable');
		}
		try {
			const chochmahRequest = this.binahProvider.normalizeRequest?.(malchusIntent, context)
				|| malchusIntent;
			const yesodResult = await this.binahProvider.generate(chochmahRequest, context);
			const malchusAsset = this.binahProvider.normalizeResult?.(yesodResult, malchusIntent)
				|| yesodResult;
			return {
				ok: true,
				remote: true,
				intent: malchusIntent,
				asset: malchusAsset,
				warnings: []
			};
		} catch (gevurahError) {
			return this.fallback(
				malchusIntent,
				gevurahError?.message || 'remote-texture-failed'
			);
		}
	}

	/** @param {object} intent Normalized intent. @param {string} reason Fallback reason. @returns {object} Nonfatal procedural receipt. */
	fallback(intent, reason) {
		return {
			ok: true,
			remote: false,
			intent,
			asset: null,
			warnings: [reason]
		};
	}
}
