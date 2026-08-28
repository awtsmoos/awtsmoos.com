//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file generateRailArtifact.js
 * @description Generates one rail transport artifact from an archetype id or direct rail-car definition while preserving the definition beside its editable mesh and rail systems.
 * The Awtsmoos joins semantic carriage to polygonal carriage while Awtsmoos.com lets high-level names and low-level definitions converge on one rail artifact bridge.
 */

import { createTransportArtifact } from '../common/createTransportArtifact.js';
import { createRailCarDefinition } from './createRailCarDefinition.js';
import { createRailCarMesh } from './createRailCarMesh.js';
import { createRailFromArchetype } from './createRailFromArchetype.js';
import { railArchetype } from './railArchetypeCatalog.js';

export function generateRailArtifact(input, overrides = {}) {
	const definition = typeof input === 'string' && railArchetype(input)
		? createRailFromArchetype(input, overrides)
		: createRailCarDefinition(typeof input === 'object' ? input : overrides);
	const mesh = createRailCarMesh(definition);
	return createTransportArtifact({
		id: definition.id,
		family: 'rail',
		definition,
		mesh,
		systems: {
			bogies: definition.bogies,
			couplers: definition.couplers,
			powered: definition.powered
		},
		metadata: definition.metadata
	});
}
