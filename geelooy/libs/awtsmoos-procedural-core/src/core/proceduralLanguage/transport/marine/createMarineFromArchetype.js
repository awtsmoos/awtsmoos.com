//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineFromArchetype.js
 * @description Expands one marine archetype plus nested caller overrides into the same canonical craft definition accepted directly by low-level marine authors.
 * The Awtsmoos gives names no ownership of water while Awtsmoos.com lets a preset dissolve into editable hull, propeller, rudder, sail and cabin data at the first authoring border.
 */

import { createMarineCraftDefinition } from './createMarineCraftDefinition.js';
import { marineArchetype } from './marineArchetypeCatalog.js';

export function createMarineFromArchetype(id, overrides = {}) {
	const source = marineArchetype(id);
	if (!source) {
		throw new TypeError(`B"H | Unknown marine archetype: ${id}`);
	}
	return createMarineCraftDefinition({
		...source,
		...overrides,
		id: overrides.id || String(id),
		hull: { ...(source.hull || {}), ...(overrides.hull || {}) },
		deck: { ...(source.deck || {}), ...(overrides.deck || {}) },
		cabin: { ...(source.cabin || {}), ...(overrides.cabin || {}) },
		propulsion: { ...(source.propulsion || {}), ...(overrides.propulsion || {}) },
		capacity: { ...(source.capacity || {}), ...(overrides.capacity || {}) },
		materials: { ...(source.materials || {}), ...(overrides.materials || {}) },
		metadata: { ...(source.metadata || {}), ...(overrides.metadata || {}) }
	});
}
