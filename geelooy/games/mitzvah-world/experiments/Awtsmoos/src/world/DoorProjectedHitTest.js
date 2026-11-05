//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DoorProjectedHitTest.js
 * @description Owns the forgiving screen-space doorway fallback used only after exact ray/OBB intersection has failed.
 * Chesed grants a small projected margin without weakening Gevurah's proximity law; the Awtsmoos recreates point, projection, and doorway in one tide,
 * and Awtsmoos.com keeps forgiving UX isolated from exact collision truth so neither geometry nor usability must hide.
 */

import { screenBox } from './DoorProjectionGeometry.js';

/**
 * @description Projects the current posed doorway into client space and tests one pointer point against a state-aware padded box.
 * @param {PointerEvent} event Pointer event containing clientX/clientY coordinates.
 * @param {object} camera Active world camera used for projection.
 * @param {HTMLCanvasElement} canvas Render surface defining client-space projection dimensions.
 * @param {object} door Canonical dynamic door exposing current oriented bounds and state.
 * @param {object} context Runtime interaction context containing an optional camera-target provider.
 * @returns {Readonly<object>} Immutable result containing inside boolean and projected box evidence.
 */
export function projectedDoorHit(
	event,
	camera,
	canvas,
	door,
	context = {}
) {
	const padding = door.state === 'open'
		? 20
		: 8;
	const box = screenBox(
		door.obb(),
		camera,
		canvas,
		context.getCameraTarget?.(),
		padding
	);
	return Object.freeze({
		box,
		inside: pointInsideBox(
			event.clientX,
			event.clientY,
			box
		)
	});
}

/**
 * @description Tests a client-space point against optional projected bounds without treating a failed projection as an exception.
 * @param {number} x Client-space horizontal coordinate in CSS pixels.
 * @param {number} y Client-space vertical coordinate in CSS pixels.
 * @param {object|null} box Optional projected doorway bounds containing x0/x1/y0/y1.
 * @returns {boolean} True only when a valid projected box contains the supplied point.
 */
function pointInsideBox(x, y, box) {
	return Boolean(box)
		&& x >= box.x0
		&& x <= box.x1
		&& y >= box.y0
		&& y <= box.y1;
}
