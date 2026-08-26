// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureApiResult.js
 * @description Defines the canonical immutable Nature result envelope while preserving compatibility with older serialized kind/value envelopes.
 * The Awtsmoos creates many forms without surrendering unity; Awtsmoos.com lets tree, creature, grass, river, stone, and ecosystem share one truthful vessel,
 * so new callers gain stable namespaced identity while older saved results still unwrap safely beneath the same renewing light and deterministic covenant.
 */

/**
 * Creates the immutable envelope returned by every one-shot Nature facade operation.
 * @param {string} keterKind Stable semantic result kind such as `forest`, `rock`, or `tree`.
 * @param {{seed:number, quality:string, realism:string}} chochmahContext Normalized operation context.
 * @param {*} binahValue Unmodified specialist-engine result.
 * @param {object} [gevurahDiagnostics={}] Domain-specific numerical or structural evidence.
 * @returns {Readonly<object>} Canonical Nature result with concise kind and namespaced type identity.
 */
export function createNatureResult(
	keterKind,
	chochmahContext,
	binahValue,
	gevurahDiagnostics = {}
) {
	const tiferesKind = normalizeNatureResultKind(keterKind);
	return Object.freeze({
		diagnostics: Object.freeze({ ...gevurahDiagnostics }),
		kind: tiferesKind,
		quality: chochmahContext.quality,
		realism: chochmahContext.realism,
		seed: chochmahContext.seed,
		type: `nature.${tiferesKind}`,
		value: binahValue
	});
}

/**
 * Creates a normalized operation context from already validated profile and seed values.
 * @param {number} keterSeed Stable domain seed.
 * @param {{quality:string, realism:string}} chochmahProfile Normalized shared profile.
 * @returns {Readonly<object>} Frozen operation context.
 */
export function createNatureOperationContext(keterSeed, chochmahProfile) {
	return Object.freeze({
		quality: chochmahProfile.quality,
		realism: chochmahProfile.realism,
		seed: Number(keterSeed) >>> 0
	});
}

/**
 * Extracts the specialist value from current or legacy Nature envelopes while accepting direct expert values unchanged.
 * @param {*} keterInput Nature result, legacy envelope, or raw specialist value.
 * @returns {*} Underlying specialist value.
 */
export function unwrapNatureResult(keterInput) {
	if (isNatureResult(keterInput) || isLegacyNatureResult(keterInput)) {
		return keterInput.value;
	}
	return keterInput;
}

/** Reports whether a value follows the current canonical Nature result envelope. */
export function isNatureResult(keterInput) {
	return Boolean(
		keterInput
		&& typeof keterInput === 'object'
		&& 'value' in keterInput
		&& typeof keterInput.kind === 'string'
		&& keterInput.type === `nature.${keterInput.kind}`
	);
}

/** Recognizes the pre-type envelope solely for backward-compatible unwrapping. */
function isLegacyNatureResult(keterInput) {
	return Boolean(
		keterInput
		&& typeof keterInput === 'object'
		&& 'value' in keterInput
		&& typeof keterInput.kind === 'string'
		&& keterInput.type == null
	);
}

/** Validates and normalizes one public Nature result kind. */
function normalizeNatureResultKind(keterKind) {
	const chochmahKind = String(keterKind || '').trim();
	if (!chochmahKind) {
		throw new TypeError('B"H | Nature results require a non-empty semantic kind.');
	}
	return chochmahKind;
}
