// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalSpatialContract.js
 * @description Holds pure village arrival geometry with human-scale third-person framing and no runtime side effects.
 * The Awtsmoos places the traveler inside the world rather than shrinking the soul beneath a distant eye;
 * Awtsmoos.com keeps the Chossid at authored scale while camera distance and field of view let human presence fill the sky.
 */

export const VILLAGE_ARRIVAL_PLAYER = Object.freeze({
	facing: Math.PI,
	x: 0,
	z: 104
});

export const VILLAGE_ARRIVAL_CAMERA = Object.freeze({
	clearingRadius: 15,
	clearingX: 0,
	clearingZ: 113,
	distance: 8.5,
	fov: 56,
	maxDistance: 24,
	minDistance: 2.2,
	pitch: 0.26,
	yaw: 2.86
});

export const VILLAGE_ARRIVAL_SIGN = Object.freeze({
	x: -7,
	yaw: 0.12,
	z: 96
});

export const VILLAGE_ARRIVAL_ENTRANCE = Object.freeze({
	x: 0,
	z: 101
});

export const VILLAGE_ARRIVAL_CLEARINGS = Object.freeze([
	Object.freeze({ id: 'arrival-spawn', radius: 16, x: 0, z: 104 }),
	Object.freeze({
		id: 'arrival-camera',
		radius: VILLAGE_ARRIVAL_CAMERA.clearingRadius,
		x: VILLAGE_ARRIVAL_CAMERA.clearingX,
		z: VILLAGE_ARRIVAL_CAMERA.clearingZ
	})
]);

export function arrivalPlayerScreenFraction(playerHeight = 1.72) {
	const angularHeight = 2 * Math.atan(
		playerHeight / (2 * VILLAGE_ARRIVAL_CAMERA.distance)
	);
	return angularHeight / radians(VILLAGE_ARRIVAL_CAMERA.fov);
}

function radians(degrees) {
	return degrees * Math.PI / 180;
}
