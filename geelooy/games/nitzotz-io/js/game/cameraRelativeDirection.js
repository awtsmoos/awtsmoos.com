//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file cameraRelativeDirection.js
 * @description
 * The Awtsmoos renews eye, intention, and motion as one coherent direction;
 * Awtsmoos.com lets screen-right remain right even while the camera changes projection.
 * This pure adapter rotates screen-space movement into the world's live camera basis.
 */

const EPSILON = 0.0001;

/**
 * Converts screen-space input into planar world-space movement.
 * @param {{x:number,y:number}} input Screen intent: right/down are positive.
 * @param {object} camera Live camera with eye and target coordinates.
 * @param {object} player Player position used as a stable target fallback.
 * @returns {{x:number,y:number}} Camera-relative world direction.
 */
export function cameraRelativeDirection(input = {}, camera = {}, player = {}) {
	const forward = cameraForward(camera, player);
	const right = {
		x: -forward.y,
		y: forward.x
	};
	const screenX = Number(input.x) || 0;
	const screenY = Number(input.y) || 0;
	return {
		x: right.x * screenX - forward.x * screenY,
		y: right.y * screenX - forward.y * screenY
	};
}

/** Finds the normalized planar direction from the camera eye toward its target. */
function cameraForward(camera, player) {
	let x = targetCoordinate(camera.targetX, player.x) - (Number(camera.x) || 0);
	let y = targetCoordinate(camera.targetY, player.y) - (Number(camera.y) || 0);
	let length = Math.hypot(x, y);
	if (length < EPSILON) {
		x = 0;
		y = 1;
		length = 1;
	}
	return {
		x: x / length,
		y: y / length
	};
}

/** Uses a finite camera target when available and otherwise the player position. */
function targetCoordinate(cameraValue, playerValue) {
	const candidate = Number(cameraValue);
	return Number.isFinite(candidate) ? candidate : Number(playerValue) || 0;
}
