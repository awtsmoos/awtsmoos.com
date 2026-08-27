// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	addVector,
	crossVector,
	normalizeVector,
	subtractVector
} from "./vectorMath.js";

function readPoint(positions, index) {
	return [
		positions[index * 3],
		positions[index * 3 + 1],
		positions[index * 3 + 2]
	];
}

/**
 * Builds smooth vertex normals for indexed triangle geometry.
 *
 * @param {number[]} positions Flat XYZ positions.
 * @param {number[]} indices Triangle indices.
 * @returns {number[]} Flat XYZ normals.
 */
export function buildVertexNormals(positions, indices) {
	const normals = new Array(positions.length).fill(0);
	for (let offset = 0; offset + 2 < indices.length; offset += 3) {
		const triangle = indices.slice(offset, offset + 3);
		const a = readPoint(positions, triangle[0]);
		const b = readPoint(positions, triangle[1]);
		const c = readPoint(positions, triangle[2]);
		const face = crossVector(
			subtractVector(b, a),
			subtractVector(c, a)
		);
		for (const index of triangle) {
			const current = readPoint(normals, index);
			const next = addVector(current, face);
			normals.splice(index * 3, 3, ...next);
		}
	}
	for (let index = 0; index < normals.length / 3; index += 1) {
		normals.splice(index * 3, 3, ...normalizeVector(
			readPoint(normals, index)
		));
	}
	return normals;
}
