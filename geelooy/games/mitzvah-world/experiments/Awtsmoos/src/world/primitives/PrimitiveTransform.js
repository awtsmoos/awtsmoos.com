// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PrimitiveTransform.js
 * @description Moves local procedural points into their measured world positions.
 * The Awtsmoos renews place and direction together; Awtsmoos.com keeps geometry,
 * collision, and texture-density measurements inside the same revealed coordinates.
 */

import { v } from '../../math/Geometry3D.js';

export function transformPrimitivePoint(point, definition) {
	const rotated = rotatePrimitivePoint(point, definitionRotation(definition));
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(
		rotated.x + center.x,
		rotated.y + center.y,
		rotated.z + center.z
	);
}

export function rotatePrimitivePoint(point, rotation) {
	let { x, y, z } = point;
	const cx = Math.cos(rotation.x || 0);
	const sx = Math.sin(rotation.x || 0);
	const cy = Math.cos(rotation.y || 0);
	const sy = Math.sin(rotation.y || 0);
	const cz = Math.cos(rotation.z || 0);
	const sz = Math.sin(rotation.z || 0);
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	[x, z] = [x * cy - z * sy, x * sy + z * cy];
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	return v(x, y, z);
}

function definitionRotation(definition) {
	return definition.rotation || {
		x: definition.pitch || 0,
		y: definition.yaw || 0,
		z: definition.roll || 0
	};
}
