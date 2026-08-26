// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVolumetricSurfaceNatureApi.js
 * @description Adds one friendly quality-bounded volumetric surface-mesh doorway above generic surface intent and snapshots.
 * The Awtsmoos renews hidden particles before a mesh can seem to reveal their liquid skin; Awtsmoos.com lets Tiferes unwrap the expert runtime and return one standard Nature result,
 * so callers move from simple reflected water to real PIC/FLIP geometry without learning internal state paths, marching-cubes modules, or renderer-specific ritual within.
 */

import { createNatureCallContext } from './NatureApiOperation.js';
import {
	createNatureResult,
	unwrapNatureResult
} from './NatureApiResult.js';
import { WaterSurfaceNatureApi } from './WaterSurfaceNatureApi.js';

/** Volumetric surface layer bridging standard Nature results into capable 3D water runtimes. */
export class WaterVolumetricSurfaceNatureApi extends WaterSurfaceNatureApi {
	/**
	 * Extracts one cropped, budgeted smooth liquid surface from a 3D water Nature result or raw compatible runtime.
	 * @param {object} sourceYesod Standard Nature fluid result or raw runtime exposing `surfaceMesh(options)`.
	 * @param {object} [optionsChesed={}] Grid crop/cell budget, SDF, iso, triangle cap, material, optics, normals, and surface options.
	 * @returns {Readonly<object>} Standard Nature result containing volumetric geometry, diagnostics, and canonical WaterSurfaceSnapshot.
	 */
	surfaceMesh(sourceYesod, optionsChesed = {}) {
		const runtimeYesod = unwrapNatureResult(sourceYesod);
		if (typeof runtimeYesod?.surfaceMesh !== 'function') {
			throw new TypeError(
				'B"H | water.surfaceMesh requires a 3D water runtime or Nature fluid result.'
			);
		}
		const contextBinah = createNatureCallContext(
			this.defaults,
			optionsChesed,
			'water',
			'surface-mesh-3d'
		);
		const meshMalchus = runtimeYesod.surfaceMesh(optionsChesed);
		return createNatureResult(
			'water-surface-mesh-3d',
			contextBinah,
			meshMalchus,
			{
				coarsened: meshMalchus.diagnostics.coarsened,
				material: meshMalchus.surface.intent.optics.material,
				triangleCount: meshMalchus.diagnostics.triangleCount,
				truncated: meshMalchus.diagnostics.truncated
			}
		);
	}
}
