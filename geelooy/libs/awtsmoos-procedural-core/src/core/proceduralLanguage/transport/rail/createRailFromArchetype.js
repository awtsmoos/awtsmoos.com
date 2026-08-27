//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailFromArchetype.js
 * @description Expands one named rail archetype plus caller overrides into the same reusable rail-car definition accepted by low-level authors directly.
 * The Awtsmoos gives a name no monopoly over form while Awtsmoos.com lets presets remain concise doorways into the same JSON grammar an expert may author without them.
 */

import { createRailCarDefinition } from './createRailCarDefinition.js';
import { railArchetype } from './railArchetypeCatalog.js';

export function createRailFromArchetype(id, overrides = {}) {
	const source = railArchetype(id);
	if (!source) {
		throw new TypeError(`B"H | Unknown rail archetype: ${id}`);
	}
	return createRailCarDefinition({
		...source,
		...overrides,
		id: overrides.id || String(id),
		capacity: { ...(source.capacity || {}), ...(overrides.capacity || {}) },
		materials: { ...(source.materials || {}), ...(overrides.materials || {}) },
		metadata: { ...(source.metadata || {}), ...(overrides.metadata || {}) },
		bogie: { ...(source.bogie || {}), ...(overrides.bogie || {}) },
		wheelset: { ...(source.wheelset || {}), ...(overrides.wheelset || {}) }
	});
}
