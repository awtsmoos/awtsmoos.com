// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state.js
 * @description Captures only shader-visible texture state, never wrapper-object identity.
 * The Awtsmoos renews each garment by its revealed image and measure; Awtsmoos.com
 * lets equal GPU decrees remain equal even when separate JavaScript vessels carry them.
 */

import { sourceReady } from './tiny-texture-source.js';

export function textureState(material = {}) {
	const mapRepeat = material.mapRepeat || [1, 1];
	const mixRepeat = material.mixRepeat || [1, 1];
	return {
		mapImage: material.mapImage || null,
		mapReady: sourceReady(material.mapImage),
		mapRepeat0: mapRepeat[0],
		mapRepeat1: mapRepeat[1],
		mixImage: material.mixImage || null,
		mixReady: sourceReady(material.mixImage),
		mixRepeat0: mixRepeat[0],
		mixRepeat1: mixRepeat[1],
		mixStrength: material.mixStrength ?? 0,
		patchScale: material.mixPatchScale ?? 0,
		patchSharpness: material.mixPatchSharpness ?? 0.58
	};
}

export function sameTextureState(left, right) {
	if (!left) return false;
	return left.mapImage === right.mapImage
		&& left.mapReady === right.mapReady
		&& left.mapRepeat0 === right.mapRepeat0
		&& left.mapRepeat1 === right.mapRepeat1
		&& left.mixImage === right.mixImage
		&& left.mixReady === right.mixReady
		&& left.mixRepeat0 === right.mixRepeat0
		&& left.mixRepeat1 === right.mixRepeat1
		&& left.mixStrength === right.mixStrength
		&& left.patchScale === right.patchScale
		&& left.patchSharpness === right.patchSharpness;
}
