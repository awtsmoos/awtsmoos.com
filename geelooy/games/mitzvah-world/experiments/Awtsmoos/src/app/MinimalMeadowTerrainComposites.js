// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainComposites.js
 * @description Preserves the legacy facade while returning independent source images, never mosaics.
 * The Awtsmoos unites many garments without sewing visible squares beside one another; Awtsmoos.com
 * entrusts blending to continuous shader masks while every decoded source keeps its native pixels.
 */

import { minimalMeadowTerrainSourceRoles } from './MinimalMeadowTerrainSources.js';

/**
 * Returns renderer-ready source roles without drawing, scaling, or resampling any image.
 *
 * @param {object} images Loaded ground source images.
 * @param {Document} documentValue Preserved legacy argument; deliberately unused.
 * @returns {object} Independent images plus anti-mosaic evidence.
 */
export function createMinimalMeadowTerrainComposites(
	images,
	documentValue = globalThis.document
) {
	void documentValue;
	const roles = minimalMeadowTerrainSourceRoles(images);
	const independentSources = Object.values(roles).filter(Boolean);
	return Object.freeze({
		...roles,
		evidence: Object.freeze({
			compositeCanvases: 0,
			independentSourceCount: new Set(independentSources).size,
			mosaic: false,
			resampled: false,
			sourceResolutionPolicy: 'decoded-image-preserved'
		})
	});
}
