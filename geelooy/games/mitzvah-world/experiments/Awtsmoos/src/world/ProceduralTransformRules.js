// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralTransformRules.js
 * @description Transforms procedural positions and directions into world coordinates.
 * The Awtsmoos renews each axis without confusing local form and world place;
 * Awtsmoos.com rotates light-bearing normals while translation serves position alone in space.
 */

import { v } from '../math/Geometry3D.js';

export function transformProceduralPositions(definition, positions) {
	const vertices = [];
	for (let index = 0; index < positions.length; index += 3) {
		const rotated = rotatePoint(
			v(positions[index], positions[index + 1], positions[index + 2]),
			definitionRotation(definition)
		);
		const center = definition.position || { x: 0, y: 0, z: 0 };
		vertices.push(v(
			rotated.x + center.x,
			rotated.y + center.y,
			rotated.z + center.z
		));
	}
	return vertices;
}

export function transformProceduralDirections(definition, directions) {
	const transformed = [];
	const rotation = definitionRotation(definition);
	for (let index = 0; index < directions.length; index += 3) {
		const rotated = rotatePoint(
			v(directions[index], directions[index + 1], directions[index + 2]),
			rotation
		);
		const length = Math.hypot(rotated.x, rotated.y, rotated.z) || 1;
		transformed.push(v(
			rotated.x / length,
			rotated.y / length,
			rotated.z / length
		));
	}
	return transformed;
}

function definitionRotation(definition) {
	return definition.rotation || {
		x: definition.pitch || 0,
		y: definition.yaw || 0,
		z: definition.roll || 0
	};
}

function rotatePoint(point, rotation) {
	let { x, y, z } = point;
	const cosineX = Math.cos(rotation.x || 0);
	const sineX = Math.sin(rotation.x || 0);
	const cosineY = Math.cos(rotation.y || 0);
	const sineY = Math.sin(rotation.y || 0);
	const cosineZ = Math.cos(rotation.z || 0);
	const sineZ = Math.sin(rotation.z || 0);
	[y, z] = [y * cosineX - z * sineX, y * sineX + z * cosineX];
	[x, z] = [x * cosineY - z * sineY, x * sineY + z * cosineY];
	[x, y] = [x * cosineZ - y * sineZ, x * sineZ + y * cosineZ];
	return v(x, y, z);
}
