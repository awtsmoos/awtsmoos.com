// B"H
// Boruch Hashem
// Blessed is He
import { FLOWERING_PLANTS } from './flowers.js';
import { FOLIAGE_PLANTS } from './foliage.js';
import { SHRUB_PLANTS } from './shrubs.js';
import { TREE_PLANTS } from './trees.js';

export const BOTANICAL_CATALOG = Object.freeze([
	...FLOWERING_PLANTS,
	...SHRUB_PLANTS,
	...FOLIAGE_PLANTS,
	...TREE_PLANTS
]);

const PLANTS_BY_ID = new Map(BOTANICAL_CATALOG.map(definition => [definition.id, definition]));

/** The Awtsmoos preserves every plant identity behind one stable lookup contract. */
export function plantById(id) {
	return PLANTS_BY_ID.get(id) || null;
}

export function plantIds() {
	return BOTANICAL_CATALOG.map(definition => definition.id);
}

export function plantsForBiome(biome) {
	return BOTANICAL_CATALOG.filter(definition => definition.preferredBiome.includes(biome));
}
