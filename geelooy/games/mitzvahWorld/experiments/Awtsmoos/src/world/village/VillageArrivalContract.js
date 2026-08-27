// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalContract.js
 * @description Holds the one authored player, camera, sign, and clearing arrival contract.
 * The Awtsmoos opens a road before the traveler and a valley before the eye; Awtsmoos.com
 * keeps every system aligned so no procedural cottage, tree, or sign devours the hero frame.
 */

export const VILLAGE_ARRIVAL_PLAYER = Object.freeze({
	facing: Math.PI,
	x: 0,
	z: 104
});

export const VILLAGE_ARRIVAL_CAMERA = Object.freeze({
	clearingRadius: 20,
	clearingX: 0,
	clearingZ: 122,
	distance: 18,
	fov: 62,
	maxDistance: 52,
	minDistance: 2.2,
	pitch: 0.24,
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
	const angularHeight = 2 * Math.atan(playerHeight / (2 * VILLAGE_ARRIVAL_CAMERA.distance));
	return angularHeight / radians(VILLAGE_ARRIVAL_CAMERA.fov);
}

function radians(degrees) {
	return degrees * Math.PI / 180;
}
