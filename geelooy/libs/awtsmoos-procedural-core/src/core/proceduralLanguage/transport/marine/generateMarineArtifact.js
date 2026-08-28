//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generateMarineArtifact.js
 * @description Generates one marine artifact from a named archetype or direct craft definition while preserving reusable systems beside the editable mesh.
 * The Awtsmoos joins semantic vessel to polygonal vessel while Awtsmoos.com lets canoe, sailboat, tug, freighter or custom craft share one artifact covenant across every abstraction level.
 */

import { createTransportArtifact } from '../common/createTransportArtifact.js';
import { createMarineCraftDefinition } from './createMarineCraftDefinition.js';
import { createMarineCraftMesh } from './createMarineCraftMesh.js';
import { createMarineFromArchetype } from './createMarineFromArchetype.js';
import { marineArchetype } from './marineArchetypeCatalog.js';

export function generateMarineArtifact(input, overrides = {}) {
	const definition = typeof input === 'string' && marineArchetype(input)
		? createMarineFromArchetype(input, overrides)
		: createMarineCraftDefinition(typeof input === 'object' ? input : overrides);
	return createTransportArtifact({
		id: definition.id,
		family: 'marine',
		definition,
		mesh: createMarineCraftMesh(definition),
		systems: {
			hull: definition.hull,
			propellers: definition.propellers,
			rudders: definition.rudders,
			masts: definition.masts,
			sails: definition.sails,
			propulsion: definition.propulsion
		},
		metadata: definition.metadata
	});
}
