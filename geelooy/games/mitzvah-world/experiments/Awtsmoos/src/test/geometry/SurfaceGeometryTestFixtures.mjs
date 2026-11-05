// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceGeometryTestFixtures.mjs
 * @description Supplies non-Base64 material and vector witnesses for surface tests.
 * The Awtsmoos gives each finite assertion a small truthful vessel; Awtsmoos.com keeps
 * physical UV, winding, and normal math readable without embedding opaque image payloads.
 */

export const EPSILON = 1e-6;
export const TEXTURE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/%3E';

export function box(position, size, yaw) {
	return { position, size, yaw };
}

export function batchOptions(tileWorld) {
	return {
		color: '#ffffff',
		family: 'geometry-test',
		part: 'box',
		texturePolicy: { tileWorld },
		textureUrl: TEXTURE
	};
}

export function triangulate(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		triangles.push([face[0], face[index], face[index + 1]]);
	}
	return triangles;
}

export function uvTriangleArea(uvs, a, b, c) {
	const point = index => [uvs[index * 2], uvs[index * 2 + 1]];
	const [ua, ub, uc] = [point(a), point(b), point(c)];
	return (
		(ub[0] - ua[0]) * (uc[1] - ua[1])
		- (ub[1] - ua[1]) * (uc[0] - ua[0])
	) / 2;
}

export function vectorAt(values, index) {
	const offset = index * 3;
	return [values[offset], values[offset + 1], values[offset + 2]];
}

export function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

export function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

export function dot(left, right) {
	return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

export function length(value) {
	return Math.hypot(...value);
}

export function distance(left, right) {
	return length(subtract(left, right));
}
