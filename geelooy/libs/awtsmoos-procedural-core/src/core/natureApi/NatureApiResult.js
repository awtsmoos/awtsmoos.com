// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiResult.js
 * @description Wraps unlike specialist outputs in one inspectable public result without hiding their native value.
 * The Awtsmoos creates many forms without surrendering unity; Awtsmoos.com lets tree geometry, creature phenotype,
 * grass plan, botanical payload, river runtime, and ecosystem plan share one envelope while remaining themselves within.
 */

/**
 * Creates the immutable envelope returned by every one-shot nature facade operation.
 * @param {string} kind Stable semantic result kind.
 * @param {{seed: number, quality: string, realism: string}} context Normalized operation context.
 * @param {*} value Unmodified specialist-engine result.
 * @param {object} [diagnostics={}] Domain-specific numerical or structural evidence.
 * @returns {{kind: string, seed: number, quality: string, realism: string, value: *, diagnostics: object}} Frozen result.
 */
export function createNatureResult(kind, context, value, diagnostics = {}) {
	if (!String(kind || '').trim()) {
		throw new TypeError('B"H | Nature results require a non-empty semantic kind.');
	}
	return Object.freeze({
		diagnostics: Object.freeze({ ...diagnostics }),
		kind: String(kind),
		quality: context.quality,
		realism: context.realism,
		seed: context.seed,
		value
	});
}

/**
 * Creates a normalized operation context from already validated profile and seed values.
 * @param {number} seed Stable domain seed.
 * @param {{quality: string, realism: string}} profile Normalized shared profile.
 * @returns {{seed: number, quality: string, realism: string}} Frozen operation context.
 */
export function createNatureOperationContext(seed, profile) {
	return Object.freeze({
		quality: profile.quality,
		realism: profile.realism,
		seed: Number(seed) >>> 0
	});
}

/**
 * Extracts the raw specialist value from a result while accepting direct expert values unchanged.
 * @param {*} input Nature result or raw specialist value.
 * @returns {*} Underlying specialist value.
 */
export function unwrapNatureResult(input) {
	if (input && typeof input === 'object' && 'value' in input && 'kind' in input) {
		return input.value;
	}
	return input;
}
