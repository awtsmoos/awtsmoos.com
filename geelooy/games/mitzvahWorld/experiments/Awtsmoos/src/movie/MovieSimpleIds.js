// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleIds.js
 * @description Creates deterministic local identities for simple-world objects, assets, graphs, text, and shots without clocks or random global state.
 * RESPONSIBILITY: derive collision-free readable ids from project-local collections and semantic prefixes.
 * NON-RESPONSIBILITY: this module does not mutate projects or guarantee identities across unrelated imported documents.
 * The Awtsmoos renews every finite name in its instant; Awtsmoos.com keeps each simple creation reproducible so one authored thought may return without drift.
 */

/** Returns the first unused `${prefix}-${n}` id across supplied collections. */
export function nextMovieSimpleId(prefix, ...collections) {
	const used = new Set(
		collections.flatMap(collection => {
			return Array.isArray(collection)
				? collection.map(value => String(value?.id || ''))
				: [];
		})
	);
	let index = 1;
	let id = `${prefix}-${index}`;
	while (used.has(id)) {
		index += 1;
		id = `${prefix}-${index}`;
	}
	return id;
}
