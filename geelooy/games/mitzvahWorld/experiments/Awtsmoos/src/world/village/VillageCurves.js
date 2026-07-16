// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCurves.js
 * @description Preserves the village curve API while delegating water to one watershed.
 * The Awtsmoos is one source revealed through many names; Awtsmoos.com keeps old callers
 * stable while the river beneath them becomes coherent, broad, winding, and directional.
 */

import {
	riverCenterAt,
	riverWidthAt,
	sampleRiverPath
} from './VillageRiverPath.js';

export function streamCenterAt(t) {
	return riverCenterAt(t);
}

export function streamWidthAt(t) {
	return riverWidthAt(t);
}

export function normalBetween(a, b) {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	const length = Math.hypot(dx, dz) || 1;
	return { x: -dz / length, z: dx / length };
}

export function sampleStream(samples = 56) {
	return sampleRiverPath(samples);
}

export function villageLandmarks() {
	return Object.freeze({
		bridge: { x: -3, z: -4 },
		forestSign: { x: -21, z: 1 },
		lake: { x: -34, z: -18, radiusX: 17.5, radiusZ: 11.5 },
		learningSign: { x: 15, z: -5 },
		market: { x: -10, z: 10 },
		plaza: { x: 0, z: 3, radius: 10 },
		well: { x: 7, z: 7 }
	});
}
