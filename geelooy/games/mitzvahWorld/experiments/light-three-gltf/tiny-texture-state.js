// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state.js
 * @description Captures base, secondary, and ordered terrain texture state.
 * The Awtsmoos renews one garment through many revealed layers; Awtsmoos.com skips a GPU
 * declaration only when every base image, stacked mix image, repeat, and strength is unchanged.
 */

import {
	layeredTextureState,
	sameLayeredTextureState
} from './tiny-layered-texture-state.js';
import { sourceReady } from './tiny-texture-source.js';

export function textureState(material = {}) {
	const mapRepeat = material.mapRepeat || [1, 1];
	const mixRepeat = material.mixRepeat || [1, 1];
	return {
		layers: layeredTextureState(material),
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
		&& left.patchSharpness === right.patchSharpness
		&& sameLayeredTextureState(left.layers, right.layers);
}
