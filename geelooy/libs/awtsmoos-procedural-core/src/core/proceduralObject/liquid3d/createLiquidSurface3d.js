// B"H
// Boruch Hashem
// Blessed is He
/** The particle river reveals a cropped SDF and indexed skin through bounded work. */

import { createParticleSignedDistanceGrid3d } from "../volumes/particleSignedDistanceGrid3d.js";
import { extractMarchingCubesSurface } from "../volumes/extractMarchingCubesSurface.js";
import { planCroppedLiquidSurfaceGrid3d } from "./planCroppedLiquidSurfaceGrid3d.js";

function explicitGridPlan(grid) {
	return Object.freeze({
		...grid,
		estimatedCells: grid.width * grid.height * grid.depth,
		coarsened: false,
		empty: false,
		bounds: null
	});
}

export function createLiquidSurface3d(state, options = {}) {
	const surfacePlan = options.grid
		? explicitGridPlan(options.grid)
		: options.crop === false
			? explicitGridPlan(state.grid)
			: planCroppedLiquidSurfaceGrid3d(state, {
				...options,
				radiusScale: options.sdf?.radiusScale
			});
	const sdf = createParticleSignedDistanceGrid3d(
		state.particleSystem,
		surfacePlan,
		options.sdf ?? {}
	);
	const geometry = extractMarchingCubesSurface(sdf, {
		id: options.id ?? `${state.id}.surface`,
		isoValue: options.isoValue ?? 0,
		maxTriangles: options.maxTriangles
	});
	return Object.freeze({
		sdf,
		geometry,
		grid: surfacePlan,
		surfacePlan
	});
}
