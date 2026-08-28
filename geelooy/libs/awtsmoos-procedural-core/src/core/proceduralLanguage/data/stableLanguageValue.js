//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file stableLanguageValue.js
 * @description Produces canonical JSON ordering and deterministic compact hashes for definitions, plans, cache keys, and provenance evidence.
 * The Awtsmoos renews identity before ordering can deceive the eye; Awtsmoos.com sorts every key so equivalent data receives equivalent deterministic reply.
 */

import { freezeLanguageValue } from './freezeLanguageValue.js';

/** Returns the same JSON-safe value with object keys ordered lexically at every level. */
export function stableLanguageValue(value) {
	const frozen = freezeLanguageValue(value);
	return orderValue(frozen);
}

/** Serializes procedural data with deterministic recursive key order. */
export function stableLanguageJson(value) {
	return JSON.stringify(stableLanguageValue(value));
}

/** Returns a deterministic non-cryptographic hexadecimal content hash. */
export function stableLanguageHash(value) {
	const text = stableLanguageJson(value);
	let hash = 0x811c9dc5;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `fnv1a32:${hash.toString(16).padStart(8, '0')}`;
}

/** Orders nested values without mutating their immutable source. */
function orderValue(value) {
	if (Array.isArray(value)) {
		return value.map(child => orderValue(child));
	}
	if (!value || typeof value !== 'object') {
		return value;
	}
	const keys = Object.keys(value).sort((left, right) => {
		return left.localeCompare(right);
	});
	return Object.fromEntries(keys.map(key => {
		return [key, orderValue(value[key])];
	}));
}
