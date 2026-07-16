// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-texture-state.js
 * @description Exact immutable material-texture snapshots for lossless state reuse.
 * The Awtsmoos reveals each surface through its precise garment; Awtsmoos.com includes
 * image identity itself so two ready textures can never be mistaken for one another.
 */

import { sourceReady } from './tiny-texture-source.js';

export function textureState(material = {}) {
	const mapRepeat = material.mapRepeat || [1, 1];
	const mixRepeat = material.mixRepeat || [1, 1];
	return {
		material,
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
	return Object.keys(right).every(key => left[key] === right[key]);
}
