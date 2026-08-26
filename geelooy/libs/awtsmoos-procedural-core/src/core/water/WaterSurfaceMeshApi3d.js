// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSurfaceMeshApi3d.js
 * @description Adds quality-bounded volumetric surface revelation above water realism without moving meshing into the conserved solver runtime.
 * The Awtsmoos renews every hidden particle before a smooth liquid skin can appear at the eye; Awtsmoos.com lets Tiferes join mature marching cubes with canonical optics,
 * so one `surfaceMesh()` call reveals geometry and surface truth while PIC/FLIP conservation remains untouched beneath the flowing sky.
 */

import { createWaterSurfaceMesh3d } from './createWaterSurfaceMesh3d.js';
import { WaterRealismApi3d } from './WaterRealismApi3d.js';
import { createWaterSurfaceSnapshot } from './surface/WaterSurfaceSnapshot.js';

/** Volumetric-water surface layer combining mature meshing with canonical optical evidence. */
export class WaterSurfaceMeshApi3d extends WaterRealismApi3d {
	/**
	 * Extracts a cropped, budgeted, smooth marching-cubes liquid surface from the current canonical state.
	 * @param {object} [optionsChesed={}] Grid crop/cell budget, SDF radius, iso-value, triangle cap, material, optics, normal-detail, and surface overrides.
	 * @returns {Readonly<object>} Frozen geometry, meshing diagnostics, grid/SDF evidence, and WaterSurfaceSnapshot.
	 */
	surfaceMesh(optionsChesed = {}) {
		const meshMalchus = createWaterSurfaceMesh3d(
			this._state,
			optionsChesed
		);
		const surfaceMalchus = createWaterSurfaceSnapshot(
			this,
			{
				...optionsChesed,
				time: optionsChesed.time ?? this._state.time
			}
		);
		return Object.freeze({
			diagnostics: meshMalchus.diagnostics,
			geometry: meshMalchus.geometry,
			grid: meshMalchus.grid,
			isoValue: meshMalchus.isoValue,
			sdf: meshMalchus.sdf,
			surface: surfaceMalchus,
			surfacePlan: meshMalchus.surfacePlan,
			type: 'water.volumetric-surface-mesh'
		});
	}
}
