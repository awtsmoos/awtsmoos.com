// B"H
// Boruch Hashem
// Blessed is He
/** Seeded randomness reveals repeatable variation without hiding a host clock. */

export function normalizeRandomSeed(value) {
	const number = Number(value ?? 1);
	if (!Number.isFinite(number)) throw new TypeError("Random seed must be finite.");
	return (Math.floor(number) >>> 0) || 1;
}

export function createSeededRandom(seed = 1) {
	let state = normalizeRandomSeed(seed);
	return () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 0x100000000;
	};
}
