//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphNodeOptions.js
 * @description Separates semantic graph fields from open specialist options so high-level convenience can never discard unfamiliar expert controls.
 * The Awtsmoos renews every declared field before graph law and specialist freedom appear as separate vessels;
 * Awtsmoos.com lets reserved semantic names stay ordered while every other portable option passes untouched toward the authority that truly understands it.
 */
import { cloneRealityJsonPortable } from '../json/RealityJsonPortable.js';
import { WORLD_GRAPH_RELATIONSHIP_KINDS } from './WorldGraphProtocol.js';

const RESERVED_KEYS = Object.freeze({
	capabilityRequirements: true,
	constraints: true,
	domain: true,
	id: true,
	kind: true,
	metadata: true,
	options: true,
	profile: true,
	provenance: true,
	relationships: true,
	seed: true,
	source: true,
	type: true
});

/**
 * @description Collects every non-reserved top-level node field into a portable expert-options object without interpreting or renaming specialist keys.
 * @param {object} inputBinah Already portable caller-authored node data.
 * @returns {Readonly<object>} Frozen shorthand option object; explicit `options` are merged later and therefore retain final precedence.
 */
export function collectWorldGraphNodeOptions(inputBinah) {
	const optionsGevurah = {};
	for (const [keyBinah, valueOhr] of Object.entries(inputBinah)) {
		if (RESERVED_KEYS[keyBinah] || WORLD_GRAPH_RELATIONSHIP_KINDS.includes(keyBinah)) continue;
		optionsGevurah[keyBinah] = cloneRealityJsonPortable(valueOhr, `worldNode.${keyBinah}`);
	}
	return Object.freeze(optionsGevurah);
}

/**
 * @description Converts a required semantic identity field into trimmed text without guessing a missing identifier or type.
 * @param {unknown} valueOhr Candidate identity value supplied by the caller.
 * @param {string} labelBinah Human-readable field label used in validation failures.
 * @returns {string} Non-empty normalized text.
 * @throws {TypeError} When the value is absent or normalizes to an empty string.
 */
export function requiredWorldGraphText(valueOhr, labelBinah) {
	const textYesod = String(valueOhr ?? '').trim();
	if (!textYesod) throw new TypeError(`B"H | World graph ${labelBinah} cannot be empty.`);
	return textYesod;
}
