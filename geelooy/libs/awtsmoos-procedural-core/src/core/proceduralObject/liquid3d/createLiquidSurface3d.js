// B"H
// Boruch Hashem
// Blessed is He
/** The particle liquid reveals a continuous SDF and indexed skin through Wave Eight. */

import { createParticleSignedDistanceGrid3d } from "../volumes/particleSignedDistanceGrid3d.js";
import { extractMarchingCubesSurface } from "../volumes/extractMarchingCubesSurface.js";

export function createLiquidSurface3d(state, options = {}) {
	const sdf = createParticleSignedDistanceGrid3d(
		state.particleSystem,
		options.grid ?? state.grid,
		options.sdf ?? {}
	);
	const geometry = extractMarchingCubesSurface(sdf, {
		id: options.id ?? `${state.id}.surface`,
		isoValue: options.isoValue ?? 0,
		maxTriangles: options.maxTriangles
	});
	return Object.freeze({ sdf, geometry });
}
