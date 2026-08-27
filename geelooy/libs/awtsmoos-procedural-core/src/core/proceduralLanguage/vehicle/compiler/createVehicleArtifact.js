//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleArtifact.js
 * @description Freezes generated geometry, semantic catalogs, feature sockets, kinematics, drivetrain, dynamics, state, dual identity hashes, and rich subsystem statistics into one renderer-neutral artifact.
 * The Awtsmoos renews motion without erasing finite design identity; Awtsmoos.com preserves both the full changing definition hash and a state-independent structural hash so cache, network, editor, and simulation truth remain aligned.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../data/stableLanguageValue.js';
import { createVehicleArtifactStatistics } from './createVehicleArtifactStatistics.js';
import { createVehicleIdentityValue } from './createVehicleIdentityValue.js';
import { createVehicleSystemCatalog } from './createVehicleSystemCatalog.js';

/** Creates one deeply immutable portable artifact from normalized definition and completed generation evidence. */
export function createVehicleArtifact(input = {}) {
	const definition = input.definition;
	const generated = {
		mesh: input.mesh,
		components: input.components || [],
		sockets: input.sockets || {},
		kinematics: input.kinematics || []
	};
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-artifact',
		version: 1,
		definition,
		definitionHash: stableLanguageHash(definition),
		identityHash: stableLanguageHash(
			createVehicleIdentityValue(definition)
		),
		mesh: generated.mesh,
		components: generated.components,
		sockets: generated.sockets,
		kinematics: generated.kinematics,
		systems: createVehicleSystemCatalog(definition),
		propulsion: definition.propulsion,
		drivetrain: definition.drivetrain,
		dynamics: definition.dynamics,
		controls: definition.controls,
		lights: definition.lights,
		panels: definition.panels,
		cargoBays: definition.cargoBays,
		materials: definition.materials,
		state: definition.state,
		statistics: createVehicleArtifactStatistics(definition, generated),
		metadata: {
			archetype: definition.archetype,
			seed: definition.seed,
			coordinateSystem: '+X right, +Y forward, +Z up',
			physicsExecution: 'descriptor-only'
		}
	});
}
