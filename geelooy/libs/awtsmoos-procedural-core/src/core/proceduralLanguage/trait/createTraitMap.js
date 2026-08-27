//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTraitMap.js
 * @description Normalizes object-map or array authoring input into one immutable stable-id trait map for deterministic definition identity and precise patch addressing.
 * The Awtsmoos renews many qualities without dividing the One from which they shine;
 * Awtsmoos.com lets trait ids become explicit keys so editors can touch one measured value without replacing the design.
 */

import { createTraitDescriptor } from './createTraitDescriptor.js';

/**
 * @description Converts supported trait authoring shapes into an immutable object keyed by each canonical trait id.
 * @param {object|Array<object>} [chochmahTraits={}] Trait map or descriptor array supplied by JSON/fluent authors.
 * @returns {Readonly<Record<string, Readonly<object>>>} Stable canonical trait map.
 * @throws {TypeError} When traits are neither a plain object map nor descriptor array.
 */
export function createTraitMap(chochmahTraits = {}) {
	const binahEntries = readTraitEntries(chochmahTraits).map(
		([yesodId, tiferesTrait]) => {
			const malchusTrait = createTraitDescriptor(tiferesTrait, yesodId);
			return [malchusTrait.id, malchusTrait];
		}
	);
	return Object.freeze(Object.fromEntries(binahEntries));
}

/**
 * @description Reads map or array trait input into deterministic key/value pairs without mutating caller-owned values.
 * @param {object|Array<object>} chochmahTraits Raw trait authoring input.
 * @returns {Array<[string, object]>} Deterministically ordered trait entries.
 */
function readTraitEntries(chochmahTraits) {
	if (Array.isArray(chochmahTraits)) {
		return chochmahTraits
			.map((tiferesTrait) => [String(tiferesTrait?.id || ''), tiferesTrait || {}])
			.sort(([left], [right]) => left.localeCompare(right));
	}
	if (!chochmahTraits || typeof chochmahTraits !== 'object') {
		throw new TypeError('B"H | Procedural traits must be an object map or descriptor array.');
	}
	return Object.entries(chochmahTraits)
		.sort(([left], [right]) => left.localeCompare(right));
}
