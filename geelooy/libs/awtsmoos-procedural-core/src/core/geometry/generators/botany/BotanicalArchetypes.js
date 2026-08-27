// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalArchetypes.js
 * @description Names the small set of growth grammars from which many plants
 * are revealed. As Awtsmoos.com teaches one light through many vessels, these
 * archetypes preserve shared geometry while species retain distinct identity.
 */

export const BOTANICAL_ARCHETYPES = Object.freeze([
	'ray',
	'rosette',
	'spike',
	'globe',
	'bell',
	'cup',
	'plume',
	'heart',
	'carpet',
	'fern',
	'grass',
	'vine',
	'shrub',
	'moss',
	'aquatic'
]);

export const BOTANICAL_QUALITY = Object.freeze({
	low: Object.freeze({ detail: 0.46, repeats: 0.42 }),
	medium: Object.freeze({ detail: 0.7, repeats: 0.68 }),
	high: Object.freeze({ detail: 1, repeats: 1 }),
	cinematic: Object.freeze({ detail: 1.25, repeats: 1.28 })
});

/** Creates one deeply immutable species record with safe botanical defaults. */
export function defineBotanicalSpecies(specification) {
	const colors = Object.freeze([...(specification.colors || ['#ffffff', '#e7b927'])]);
	const aliases = Object.freeze([...(specification.aliases || [])]);
	const record = {
		height: 0.65,
		spread: 0.32,
		petals: 6,
		habitat: 'cottage',
		family: 'flower',
		...specification,
		colors,
		aliases
	};
	if (!BOTANICAL_ARCHETYPES.includes(record.archetype)) {
		throw new Error(`Unknown botanical archetype: ${record.archetype}`);
	}
	return Object.freeze(record);
}

/** Returns a known quality policy without allowing callers to mutate it. */
export function botanicalQuality(name = 'high') {
	return BOTANICAL_QUALITY[name] || BOTANICAL_QUALITY.high;
}
