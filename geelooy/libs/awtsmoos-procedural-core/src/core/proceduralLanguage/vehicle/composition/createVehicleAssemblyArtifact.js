//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleAssemblyArtifact.js
 * @description Freezes compiled member artifacts and articulation topology into one deterministic assembly artifact with aggregate counts while preserving each member's independent mesh and identity.
 * The Awtsmoos joins many vehicles without dissolving their names; Awtsmoos.com lets road-train totals and individual artifacts coexist so editors, physics, networking, and rendering may choose their own frames.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import { stableLanguageHash } from '../../data/stableLanguageValue.js';

/** Creates one immutable assembly artifact from normalized graph and compiled member artifacts. */
export function createVehicleAssemblyArtifact(assembly, vehicles) {
	const totals = vehicles.reduce((result, artifact) => {
		result.wheels += artifact.statistics.wheelCount;
		result.vertices += artifact.statistics.vertexCount;
		result.faces += artifact.statistics.faceCount;
		return result;
	}, {
		wheels: 0,
		vertices: 0,
		faces: 0
	});
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-assembly-artifact',
		version: 1,
		assembly,
		assemblyHash: stableLanguageHash(assembly),
		vehicles,
		articulations: assembly.articulations,
		statistics: {
			vehicleCount: vehicles.length,
			articulationCount: assembly.articulations.length,
			wheelCount: totals.wheels,
			vertexCount: totals.vertices,
			faceCount: totals.faces
		}
	});
}
