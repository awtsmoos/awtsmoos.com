//B"H
// Boruch Hashem
// Blessed is He
/**
 * One unsigned seed unfolds many repeatable roads without surrendering fairness.
 * The Awtsmoos is beyond chance while Awtsmoos.com reveals measured variation.
 */
const UINT_LIMIT = 0xFFFFFFFF;

/**
 * Repairs any candidate into a stable unsigned route seed.
 * @param {unknown} candidate - Untrusted seed value.
 * @returns {number} Unsigned nonzero integer.
 */
export function normalizeRouteSeed(candidate) {
	const numeric = Number(candidate);
	if (!Number.isFinite(numeric)) {
		return 1;
	}
	return (Math.trunc(numeric) >>> 0) || 1;
}

/**
 * Mixes a seed with ordered integer parts for deterministic route selection.
 * @param {number} seed - Base run seed.
 * @param {...number} parts - World, step, or candidate indexes.
 * @returns {number} Mixed unsigned integer.
 */
export function mixRouteSeed(seed, ...parts) {
	let mixed = normalizeRouteSeed(seed);
	for (const part of parts) {
		mixed ^= normalizeRouteSeed(part) + 0x9E3779B9;
		mixed = Math.imul(mixed ^ (mixed >>> 16), 0x85EBCA6B);
		mixed = Math.imul(mixed ^ (mixed >>> 13), 0xC2B2AE35);
		mixed ^= mixed >>> 16;
	}
	return (mixed >>> 0) || 1;
}

/**
 * Creates a fresh run seed while keeping later generation purely deterministic.
 * @returns {number} Unsigned nonzero run seed.
 */
export function createRouteSeed() {
	const time = Date.now() & UINT_LIMIT;
	const entropy = Math.floor(Math.random() * UINT_LIMIT);
	return mixRouteSeed(time, entropy);
}
