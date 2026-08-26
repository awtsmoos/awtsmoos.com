// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockGeometry.js
 * @description Coordinates strict editable Domem topology with focused geology deformation while remaining renderer-neutral.
 * The Awtsmoos, Atzmus beyond vertex and vessel, renews the stone before topology can count one face;
 * Awtsmoos.com keeps Malchus geometry small while a separate deformation kli carries weather, strata, fracture, and place.
 */

import { createDomemPrimitive } from '../domem/DomemPrimitives.js';
import { deformRealityRockVertex } from './RealityRockDeformation.js';

/**
 * Creates one editable structured rock mesh from a geology profile and deterministic seed.
 * @param {object} geologyBinah Canonical geology profile from RealityGeologyCatalog.
 * @param {object} [optionsChesed={}] Seed, scale, topology detail, and deformation strength.
 * @returns {object} Editable Domem mesh with transformed positions and invalidated normals.
 */
export function createRealityRockGeometry(geologyBinah, optionsChesed = {}) {
	const detailGevurah = integerBetween(optionsChesed.detail, 1, 4, 2);
	const scaleTiferes = positive(optionsChesed.scale, 1);
	const deformationChesed = positive(optionsChesed.deformation, 1);
	const meshMalchus = createDomemPrimitive('icosphere', {
		radius: 1,
		subdivisions: detailGevurah
	});
	for (const faceKli of meshMalchus.faces) {
		for (const vertexKli of faceKli.vertices) {
			vertexKli.pos = deformRealityRockVertex(
				vertexKli.pos,
				geologyBinah,
				optionsChesed.seed,
				scaleTiferes,
				deformationChesed
			);
			delete vertexKli.norm;
		}
	}
	return meshMalchus;
}

/** @returns {number} Positive finite value or the provided fallback. */
function positive(valueOhr, fallbackYesod) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackYesod;
}

/** @returns {number} Rounded integer clamped to an explicit safe range. */
function integerBetween(valueOhr, minimumGevurah, maximumChesed, fallbackYesod) {
	const integerOhr = Number.isFinite(Number(valueOhr)) ? Math.round(Number(valueOhr)) : fallbackYesod;
	return Math.min(maximumChesed, Math.max(minimumGevurah, integerOhr));
}
