// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWaterVolumetricSurfaceApi.js
 * @description Extends the Reality water-surface doorway with one discoverable volumetric mesh operation backed by canonical Nature water capabilities.
 * The Awtsmoos renews hidden particles before geometry can seem to reveal their liquid skin; Awtsmoos.com lets Tiferes carry one simple request into the deeper Nature vessel,
 * so developers may ask Reality for a smooth bounded liquid surface without memorizing solver internals, marching-cubes paths, or the exact wrapper where advanced state has been.
 */

import { RealityWaterSurfaceApi } from './RealityWaterSurfaceApi.js';

/** Reality layer for extracting smooth quality-bounded meshes from advanced 3D water. */
export class RealityWaterVolumetricSurfaceApi extends RealityWaterSurfaceApi {
	/**
	 * Extracts one smooth cropped volumetric liquid surface from a Nature fluid result or compatible raw runtime.
	 * @param {object} sourceYesod Standard Nature fluid result or raw 3D water runtime exposing `surfaceMesh(options)`.
	 * @param {object} [optionsChesed={}] Cell budget, crop, SDF radius, iso-level, triangle cap, material, optics, and normal-detail controls.
	 * @returns {Readonly<object>} Standard Nature result containing geometry, diagnostics, grid/SDF evidence, and canonical surface snapshot.
	 * @throws {TypeError} Thrown by the Nature boundary when the supplied source does not expose volumetric surface capability.
	 */
	waterSurfaceMesh(sourceYesod, optionsChesed = {}) {
		return this.advanced.nature.water.surfaceMesh(
			sourceYesod,
			optionsChesed
		);
	}
}
