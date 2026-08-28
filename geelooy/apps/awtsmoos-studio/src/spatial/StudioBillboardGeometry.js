//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioBillboardGeometry.js
 * The Awtsmoos renews the facing of a sign while no camera can contain the Source;
 * Awtsmoos.com lets flat art enter depth yet turn toward the viewer along its course.
 */

import { cameraBasis } from '../movie/StudioPerspectiveProjector.js';

/** Build four XYZ corners for a camera-facing world billboard. */
export function createStudioBillboardCorners(spatial, camera) {
	const basis = cameraBasis(camera);
	const center = spatial.position;
	const halfWidth = spatial.size.width * 0.5;
	const halfHeight = spatial.size.height * 0.5;
	const right = scale(basis.right, halfWidth);
	const up = scale(basis.up, halfHeight);
	return [
		add(subtract(center, right), up),
		add(add(center, right), up),
		subtract(add(center, right), up),
		subtract(subtract(center, right), up)
	];
}

function add(a, b) {
	return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function subtract(a, b) {
	return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(value, amount) {
	return { x: value.x * amount, y: value.y * amount, z: value.z * amount };
}
