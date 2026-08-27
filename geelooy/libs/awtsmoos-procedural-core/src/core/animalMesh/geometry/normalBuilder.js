// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	addVector,
	crossVector,
	normalizeVector,
	subtractVector
} from "./vectorMath.js";

export function buildVertexNormals(positions, indices) {
	const normals = new Array(positions.length).fill(0);

	for (let index = 0; index < indices.length; index += 3) {
		const indexA = indices[index];
		const indexB = indices[index + 1];
		const indexC = indices[index + 2];
		const pointA = readPoint(positions, indexA);
		const pointB = readPoint(positions, indexB);
		const pointC = readPoint(positions, indexC);
		const normal = crossVector(
			subtractVector(pointB, pointA),
			subtractVector(pointC, pointA)
		);
		accumulate(normals, indexA, normal);
		accumulate(normals, indexB, normal);
		accumulate(normals, indexC, normal);
	}
	for (let vertexIndex = 0; vertexIndex < positions.length / 3; vertexIndex += 1) {
		const normal = normalizeVector(readPoint(normals, vertexIndex), [
			0,
			0,
			1
		]);
		writePoint(normals, vertexIndex, normal);
	}
	return normals;
}

function readPoint(values, index) {
	const offset = index * 3;
	return [
		values[offset],
		values[offset + 1],
		values[offset + 2]
	];
}

function writePoint(values, index, point) {
	const offset = index * 3;
	values[offset] = point[0];
	values[offset + 1] = point[1];
	values[offset + 2] = point[2];
}

function accumulate(values, index, normal) {
	writePoint(
		values,
		index,
		addVector(readPoint(values, index), normal)
	);
}
