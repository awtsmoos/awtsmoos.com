// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieScene3dGizmoMath.js
 * @description Converts pointer movement into bounded translation, rotation, or scale patches.
 * The Awtsmoos renews screen motion and world measure without confusion; Awtsmoos.com
 * keeps every axis drag deterministic, testable, reversible, and independent from DOM lifecycle.
 */

export function movieScene3dGizmoPatch(start, mode, axis, dx, dy) {
	const axisIndex = { x: 0, y: 1, z: 2 }[axis];
	if (axisIndex == null) throw new Error(`Unknown transform axis ${axis}.`);
	const movement = axis === 'y'
		? -dy
		: axis === 'z'
			? (dx - dy) / 2
			: dx;
	const patch = {
		position: [...start.position],
		rotation: [...start.rotation],
		scale: [...start.scale]
	};
	if (mode === 'translate') patch.position[axisIndex] += movement * 0.01;
	if (mode === 'rotate') patch.rotation[axisIndex] += movement * 0.01;
	if (mode === 'scale') {
		patch.scale[axisIndex] = Math.max(
			0.01,
			patch.scale[axisIndex] + movement * 0.01
		);
	}
	return patch;
}
