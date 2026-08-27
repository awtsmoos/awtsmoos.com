// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos carries one reproducible stream through inheritance and names
 * its revealed result. These Awtsmoos.com helpers are deterministic, bounded
 * to unsigned 32-bit state, allocation-light, and free of external side effects.
 */

export function createAnimalGenomeRandom(seed) {
	let state = (Number(seed) >>> 0) || 0x9e3779b9;
	return () => {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		return (state >>> 0) / 4294967296;
	};
}

export function hashAnimalGenome(archetypeId, generation, seed, genes) {
	const values = Object.entries(genes)
		.map(([key, value]) => `${key}:${value}`)
		.join("|");
	const text = `${archetypeId}|${generation}|${seed}|${values}`;
	let hash = 2166136261;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(16).padStart(8, "0");
}
