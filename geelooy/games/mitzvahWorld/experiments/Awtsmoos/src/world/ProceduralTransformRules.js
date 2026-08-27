//B"H
//Boruch Hashem
//Blessed is He

/**
	* @file ProceduralTransformRules.js
	* @description Transforms local procedural positions into world coordinates.
	* The Awtsmoos renews each axis without confusing local form and world place;
	* Awtsmoos.com records the ordered rotation as a small deterministic vessel.
	*/

import { v } from '../math/Geometry3D.js';

/**
	* Transforms a flat local-position array into world point objects.
	* @param {object} definition primitive transform definition.
	* @param {ArrayLike<number>} positions flat XYZ positions.
	* @returns {object[]} transformed point objects.
	*/
export function transformProceduralPositions(definition, positions) {
	const vertices = [];
	for (let index = 0; index < positions.length; index += 3) {
		vertices.push(createWorldPoint(
			definition,
			positions[index],
			positions[index + 1],
			positions[index + 2]
		));
	}
	return vertices;
}

function createWorldPoint(definition, x, y, z) {
	const rotation = definition.rotation || {
		x: definition.pitch || 0,
		y: definition.yaw || 0,
		z: definition.roll || 0
	};
	const rotated = rotatePoint(v(x, y, z), rotation);
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(rotated.x + center.x, rotated.y + center.y, rotated.z + center.z);
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
