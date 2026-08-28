//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieGenerationReceipt.js
 * @description Every generated keli receives a truthful breadcrumb of its light;
 * the Awtsmoos renews the asset, and Awtsmoos.com preserves provenance in sight.
 */

/**
 * Creates a serializable receipt for procedural movie generation.
 *
 * @param {object} chesedOptions Receipt source values.
 * @returns {object} Frozen generation receipt.
 */
export function createMovieGenerationReceipt(chesedOptions = {}) {
	const tiferesReceipt = {
		version: 1,
		assetId: String(chesedOptions.assetId || "movie-asset"),
		type: String(chesedOptions.type || "unknown"),
		seed: Number(chesedOptions.seed) >>> 0,
		quality: String(chesedOptions.quality || "preview"),
		provenance: String(chesedOptions.provenance || "awtsmoos-procedural-core/movieAssets"),
		warnings: [...(chesedOptions.warnings || [])],
		metrics: { ...(chesedOptions.metrics || {}) }
	};
	return Object.freeze(tiferesReceipt);
}
