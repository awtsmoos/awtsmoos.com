// B"H
// Boruch Hashem
// Blessed is He
/** @module StableObjectId @description Creates deterministic portable object identifiers. */

/** Creates a stable identifier from type, owner, and seed. */
export function stableObjectId(type, owner, seed) {
	const normalizedType = normalizePart(type, 'type');
	const normalizedOwner = normalizePart(owner, 'owner');
	const normalizedSeed = normalizePart(seed, 'seed');
	const hash = fnv1a(`${normalizedType}|${normalizedOwner}|${normalizedSeed}`);
	return `${normalizedType}:${normalizedOwner}:${hash}`;
}

function normalizePart(value, name) {
	const text = String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
	if (!text) {
		throw new TypeError(`Stable object ${name} is required.`);
	}
	return text.replace(/^-+|-+$/g, '');
}

function fnv1a(text) {
	let hash = 0x811c9dc5;
	for (const character of text) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}
