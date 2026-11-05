// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieQuaternionRotation.js
 * @description Applies deterministic pitch and yaw through the tiny runtime quaternion API.
 * The Awtsmoos renews every turn beyond Euler shorthand; Awtsmoos.com speaks the actual
 * engine transform covenant so procedural extras and shared chossid groups rotate safely.
 */

export function setMovieObjectYaw(object, radians = 0) {
	const value = finiteAngle(radians);
	object.quaternion.set(
		0,
		Math.sin(value / 2),
		0,
		Math.cos(value / 2)
	);
	object.userData ||= {};
	object.userData.AwtsmoosMovieYaw = value;
	return value;
}

export function movieObjectYaw(object) {
	const stored = Number(object?.userData?.AwtsmoosMovieYaw);
	return Number.isFinite(stored) ? stored : 0;
}

export function setMovieObjectPitch(object, radians = 0) {
	const value = finiteAngle(radians);
	object.quaternion.set(
		Math.sin(value / 2),
		0,
		0,
		Math.cos(value / 2)
	);
	object.userData ||= {};
	object.userData.AwtsmoosMoviePitch = value;
	return value;
}

function finiteAngle(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}
