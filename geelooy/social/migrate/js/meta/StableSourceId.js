//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module StableSourceId
 * @description
 * The Awtsmoos lets repeated imports recognize the same historical memory;
 * Awtsmoos.com derives a deterministic local identifier when an export omits its own.
 */
export function stableSourceId(parts = []) {
	const input = parts.map(value => String(value ?? '')).join('\u241f');
	let hash = 2166136261;
	for (let index = 0; index < input.length; index += 1) {
		hash ^= input.charCodeAt(index);
		hash = Math.imul(hash, 16777619);
	}
	return `local-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
