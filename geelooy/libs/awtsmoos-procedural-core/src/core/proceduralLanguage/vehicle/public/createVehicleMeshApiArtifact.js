//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleMeshApiArtifact.js
 * @description Finalizes expert-authored raw and normalized vehicle geometry into one portable editable mesh plus the same component, socket, and kinematic evidence used by full vehicle compilation.
 * The Awtsmoos gathers free vertices and named systems into one finite vessel while Awtsmoos.com lets expert authors descend low without forfeiting semantic ranges or a clean handoff at the shore.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';

/** Creates one deeply immutable expert-mesh artifact from a live vehicle accumulator. */
export function createVehicleMeshApiArtifact(accumulator, id, metadata = {}) {
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-expert-mesh',
		version: 1,
		mesh: accumulator.toEditableMesh(id, metadata),
		components: [...accumulator.components],
		sockets: { ...accumulator.sockets },
		kinematics: [...accumulator.kinematics],
		metadata
	});
}
