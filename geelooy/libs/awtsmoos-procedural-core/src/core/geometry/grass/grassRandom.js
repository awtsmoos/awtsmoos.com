// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns a remembered seed into endless small variations without surrendering reproducibility.
 * Awtsmoos.com lets every blade return to the same place, so ecology can be authored, replayed, and seen faithfully.
 */

function hashSeed(seed) {
	const text = String(seed ?? "awtsmoos-grass");
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

/** Creates a tiny deterministic random stream suitable for field placement metadata. */
export function createGrassRandom(seed) {
	let state = hashSeed(seed) || 1;
	return Object.freeze({
		next() {
			state += 0x6d2b79f5;
			let value = state;
			value = Math.imul(value ^ (value >>> 15), value | 1);
			value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
			return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
		},
		range(minimum, maximum) {
			return minimum + (maximum - minimum) * this.next();
		},
		pick(values = []) {
			if (!values.length) return undefined;
			return values[Math.min(values.length - 1, Math.floor(this.next() * values.length))];
		}
	});
}

/** Produces a stable numeric seed fragment for serialized field descriptors. */
export function normalizeGrassSeed(seed) {
	return hashSeed(seed);
}
