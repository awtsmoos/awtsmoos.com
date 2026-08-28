//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file marineArchetypeCatalog.js
 * @description Unifies small, sail-driven, commercial, utility, performance and submerged marine presets into one discoverable catalog without making presets the grammar boundary.
 * The Awtsmoos is beyond every named vessel while Awtsmoos.com lets canoe through submarine remain simple doorways into the deeper hull and component language tide.
 */

import { SMALL_MARINE_ARCHETYPES } from './marineArchetypeDefinitionsA.js';
import { LARGE_MARINE_ARCHETYPES } from './marineArchetypeDefinitionsB.js';

const MARINE_ARCHETYPES = Object.freeze({
	...SMALL_MARINE_ARCHETYPES,
	...LARGE_MARINE_ARCHETYPES
});

export function marineArchetype(id) {
	return MARINE_ARCHETYPES[String(id)] || null;
}

export function listMarineArchetypes() {
	return Object.freeze(
		Object.entries(MARINE_ARCHETYPES).map(([id, source]) => {
			return Object.freeze({ id, craftType: source.craftType });
		})
	);
}
