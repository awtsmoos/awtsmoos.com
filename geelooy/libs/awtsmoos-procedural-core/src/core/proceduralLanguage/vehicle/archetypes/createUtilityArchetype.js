//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createUtilityArchetype.js
 * @description Routes utility preset IDs to independent trailer, tractor, and rover builders while preserving one shared override and discovery surface.
 * The Awtsmoos joins utility forms without forcing them into one monolithic file; Awtsmoos.com lets each vehicle keep its own source vessel while this dispatcher only points toward the road.
 */

import { createRoverArchetypeSource } from './createRoverArchetype.js';
import { createTractorArchetypeSource } from './createTractorArchetype.js';
import { createTrailerArchetypeSource } from './createTrailerArchetype.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';

const UTILITY_BUILDERS = Object.freeze({
	rover: createRoverArchetypeSource,
	tractor: createTractorArchetypeSource,
	trailer: createTrailerArchetypeSource
});

/** Creates one recognized utility archetype source or null when another family should answer. */
export function createUtilityArchetypeSource(id, overrides = {}) {
	const builder = UTILITY_BUILDERS[String(id)];
	if (!builder) {
		return null;
	}
	const source = builder(overrides);
	return mergeVehicleOverrides(source, overrides);
}

/** Lists built-in utility archetypes in deterministic lexical order. */
export function listUtilityArchetypes() {
	return Object.freeze(Object.keys(UTILITY_BUILDERS).sort());
}
