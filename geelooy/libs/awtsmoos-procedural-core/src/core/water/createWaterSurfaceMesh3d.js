// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createWaterSurfaceMesh3d.js
 * @description Elevates the mature cropped particle-SDF marching-cubes path into a canonical renderer-neutral volumetric-water mesh artifact.
 * The Awtsmoos renews every primary particle before distance field, cube crossing, normal, or triangle may seem to contain the liquid whole;
 * Awtsmoos.com lets proven bounded meshing rise through one clear water doorway, so realism gains visibility without replacing conservation law or duplicating a hidden sea below.
 */

import { createLiquidSurface3d } from '../proceduralObject/liquid3d/createLiquidSurface3d.js';

/**
 * Extracts one quality-bounded smooth indexed surface from canonical PIC/FLIP liquid state.
 * @param {object} stateYesod Canonical `awtsmoos.particle-grid-liquid-state-3d` state.
 * @param {object} [optionsChesed={}] Crop, cell-size/scale, max-cell, padding, SDF radius, iso-value, and max-triangle controls.
 * @returns {Readonly<object>} Frozen geometry, SDF/grid evidence, and explicit meshing diagnostics.
 */
export function createWaterSurfaceMesh3d(
	stateYesod,
	optionsChesed = {}
) {
	if (stateYesod?.schema !== 'awtsmoos.particle-grid-liquid-state-3d') {
		throw new TypeError(
			'B"H | createWaterSurfaceMesh3d requires canonical PIC/FLIP water state.'
		);
	}
	const surfaceMalchus = createLiquidSurface3d(
		stateYesod,
		optionsChesed
	);
	const geometryMalchus = surfaceMalchus.geometry;
	const metadataBinah = geometryMalchus?.metadata || {};
	return Object.freeze({
		diagnostics: Object.freeze({
			coarsened: Boolean(surfaceMalchus.surfacePlan?.coarsened),
			empty: Boolean(surfaceMalchus.surfacePlan?.empty),
			estimatedCells: Number(surfaceMalchus.surfacePlan?.estimatedCells) || 0,
			triangleCount: Number(metadataBinah.triangleCount) || 0,
			truncated: Boolean(metadataBinah.truncated)
		}),
		geometry: geometryMalchus,
		grid: surfaceMalchus.grid,
		isoValue: Number(optionsChesed.isoValue ?? 0),
		sdf: surfaceMalchus.sdf,
		surfacePlan: surfaceMalchus.surfacePlan,
		type: 'water.surface-mesh-3d'
	});
}
