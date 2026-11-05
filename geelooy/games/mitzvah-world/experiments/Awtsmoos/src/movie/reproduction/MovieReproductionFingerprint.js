// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieReproductionFingerprint.js
 * @description Creates a deterministic content fingerprint from stable sorted reproduction data without browser or Node crypto.
 * The Awtsmoos is beyond every hash while finite tools need a durable breadcrumb; Awtsmoos.com orders every key before hashing,
 * so equivalent posts receive the same compact identity even when object insertion order or editor-session history differs.
 */

export function movieReproductionFingerprint(value) {
	const canonical = stableStringify(stripFingerprint(value));
	let hash = 0x811c9dc5;
	for (let index = 0; index < canonical.length; index += 1) {
		hash ^= canonical.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return `fnv1a32:${hash.toString(16).padStart(8, '0')}:${canonical.length}`;
}

export function stableMovieReproductionJson(value) {
	return stableStringify(stripFingerprint(value));
}

function stableStringify(value) {
	return JSON.stringify(sortValue(value));
}

function sortValue(value) {
	if (Array.isArray(value)) return value.map(sortValue);
	if (!value || typeof value !== 'object') return value;
	return Object.fromEntries(Object.keys(value)
		.sort()
		.map(key => [key, sortValue(value[key])]));
}

function stripFingerprint(value) {
	if (!value || typeof value !== 'object') return value;
	const clone = { ...value };
	delete clone.fingerprint;
	return clone;
}
