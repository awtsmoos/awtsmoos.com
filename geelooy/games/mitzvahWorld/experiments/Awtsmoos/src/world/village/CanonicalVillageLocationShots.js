// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageLocationShots.js
 * @description Authors lower-river cinematic lanes from terrain-relative eye clearances and above-ground look-at targets.
 * The Awtsmoos renews river, bank, witness, mountain, and sky before the lens can flatten them;
 * Awtsmoos.com therefore stores X/Z choreography plus explicit clearance, never brittle absolute Y values that can bury a camera in earth.
 */

import {
	terrainRelativeCameraPoint,
	terrainRelativeCameraTarget
} from './VillageCameraGrounding.js';

const LOWER_RIVER_TARGET = terrainRelativeCameraTarget(7.5, 42.3, 2.6);
const FINAL_RIVER_TARGET = terrainRelativeCameraTarget(10, 44, 2.6);

const SHOTS_BY_LOCATION = Object.freeze({
	'river-garden': Object.freeze({
		aerialPullback: shot([-22, 54, 12], [-13, 58, 15], FINAL_RIVER_TARGET, 56),
		craneReveal: shot([-20, 50, 9], [-14, 46, 11], LOWER_RIVER_TARGET, 50),
		dollyIn: shot([-23, 45, 9], [-15, 43, 9], LOWER_RIVER_TARGET, 46),
		orbitLeft: shot([-18, 54, 8.5], [-11, 49, 8.5], LOWER_RIVER_TARGET, 50),
		sideTrack: shot([-20, 38, 8], [-13, 47, 8], LOWER_RIVER_TARGET, 48)
	})
});

export function canonicalVillageLocationShots(locationId) {
	return SHOTS_BY_LOCATION[String(locationId || '')] || Object.freeze({});
}

function shot(from, to, target, fieldOfView) {
	return Object.freeze({
		fieldOfView,
		from: cameraPoint(from),
		target,
		to: cameraPoint(to)
	});
}

function cameraPoint([x, z, clearance]) {
	return terrainRelativeCameraPoint(x, z, clearance);
}
