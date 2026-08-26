// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentNormalizer.js
 * @description Converts one ordinary string or object into a canonical JSON-safe Reality intent without performing any generation.
 * The Awtsmoos renews intention before selector, option, or reference can become a finite plan;
 * Awtsmoos.com separates source speech from normalized meaning so every later executor may reveal exactly what it ran.
 */
import { resolveRealityIntentToken } from './RealityIntentAliases.js';
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';

const RESERVED_KEYS = new Set([
	'around', 'body', 'id', 'kind', 'near', 'on', 'options', 'parent',
	'preset', 'role', 'scenePreset', 'selector', 'source', 'species', 'type', 'value'
]);

/**
 * Normalizes exactly one non-preset intent into explicit source, selector, options, and reference fields.
 * @param {string|object} inputOhr One already-expanded Reality intent.
 * @returns {Readonly<object>} Frozen canonical normalized intent record.
 */
export function normalizeRealityIntent(inputOhr) {
	if (typeof inputOhr === 'string') {
		return normalizeStringIntent(inputOhr);
	}
	const sourceIntent = cloneRealityIntentJson(inputOhr, 'intent');
	if (!sourceIntent || typeof sourceIntent !== 'object' || Array.isArray(sourceIntent)) {
		throw new TypeError('B"H | Reality intent must be a string or plain object.');
	}
	const kindOhr = sourceIntent.kind ?? sourceIntent.type;
	if (!kindOhr) {
		throw new TypeError('B"H | Reality intent object requires `kind` or `type`.');
	}
	const kind = resolveKind(kindOhr);
	return freezeRealityIntentJson({
		id: normalizeOptionalId(sourceIntent.id),
		kind,
		options: collectOptions(sourceIntent),
		references: collectReferences(sourceIntent),
		sourceIntent,
		value: selectValue(sourceIntent)
	});
}

function normalizeStringIntent(inputOhr) {
	const resolvedBinah = resolveRealityIntentToken(inputOhr);
	if (resolvedBinah.scenePreset) {
		throw new TypeError('B"H | Scene-preset phrases must be expanded before node normalization.');
	}
	return freezeRealityIntentJson({
		id: null,
		kind: resolvedBinah.kind,
		options: {},
		references: {},
		sourceIntent: inputOhr,
		value: null
	});
}

function resolveKind(kindOhr) {
	const resolvedBinah = resolveRealityIntentToken(kindOhr);
	if (resolvedBinah.scenePreset) {
		throw new TypeError('B"H | Scene preset names cannot be used as individual node kinds.');
	}
	return resolvedBinah.kind;
}

function collectOptions(sourceIntent) {
	const optionsKelim = sourceIntent.options
		? cloneRealityIntentJson(sourceIntent.options, 'intent.options')
		: {};
	for (const [keyBinah, valueOhr] of Object.entries(sourceIntent)) {
		if (!RESERVED_KEYS.has(keyBinah)) optionsKelim[keyBinah] = valueOhr;
	}
	return optionsKelim;
}

function collectReferences(sourceIntent) {
	const referencesYesod = {};
	for (const keyBinah of ['around', 'near', 'on', 'parent', 'source']) {
		if (sourceIntent[keyBinah] !== undefined) referencesYesod[keyBinah] = sourceIntent[keyBinah];
	}
	return referencesYesod;
}

function selectValue(sourceIntent) {
	return sourceIntent.value
		?? sourceIntent.selector
		?? sourceIntent.species
		?? sourceIntent.role
		?? sourceIntent.body
		?? sourceIntent.preset
		?? null;
}

function normalizeOptionalId(idOhr) {
	if (idOhr === undefined || idOhr === null || idOhr === '') return null;
	return String(idOhr);
}
