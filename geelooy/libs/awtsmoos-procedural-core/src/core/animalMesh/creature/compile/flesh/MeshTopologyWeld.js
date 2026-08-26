// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeshTopologyWeld.js
 * @description Deduplicates numerically coincident implicit-surface vertices and rebuilds smooth indexed normals.
 * RESPONSIBILITY: stabilize topology after field extraction while removing degenerate triangles created by quantization.
 * NON-RESPONSIBILITY: this vessel does not perform Boolean CSG, alter anatomy, select bones, or decide flesh integration policy.
 * The Awtsmoos lets countless sampled crossings return to fewer shared points without losing their revealed form;
 * Awtsmoos.com welds numerical echoes into one indexed surface whose smooth normals may carry living light through every storm.
 */

import { buildVertexNormals } from "../../../geometry/normalBuilder.js";

/**
 * Welds triangle-soup vertices using a deterministic positional quantization key.
 * @param {object} geometry Triangle soup with flat positions and sequential indices.
 * @param {object} options Positional tolerance control.
 * @returns {object} Indexed geometry with smooth vertex normals.
 */
export function weldMeshTopology(geometry, options = {}) {
	const tolerance = positive(options.tolerance, 1e-5);
	const vertices = [];
	const vertexMap = new Map();
	const remap = new Array(geometry.positions.length / 3);
	for (let vertexIndex = 0; vertexIndex < remap.length; vertexIndex += 1) {
		const point = readPoint(geometry.positions, vertexIndex);
		const key = quantizedKey(point, tolerance);
		if (!vertexMap.has(key)) {
			vertexMap.set(key, vertices.length / 3);
			vertices.push(...point);
		}
		remap[vertexIndex] = vertexMap.get(key);
	}
	const indices = rebuildTriangles(geometry.indices, remap);
	return {
		indices,
		normals: buildVertexNormals(vertices, indices),
		positions: vertices
	};
}

/** Rebuilds triangle indices while discarding collapsed zero-area index triples. */
function rebuildTriangles(sourceIndices, remap) {
	const indices = [];
	for (let offset = 0; offset < sourceIndices.length; offset += 3) {
		const first = remap[sourceIndices[offset]];
		const second = remap[sourceIndices[offset + 1]];
		const third = remap[sourceIndices[offset + 2]];
		if (first === second || second === third || third === first) {
			continue;
		}
		indices.push(first, second, third);
	}
	return indices;
}

/** Reads one three-dimensional point from a flat position array. */
function readPoint(positions, vertexIndex) {
	const offset = vertexIndex * 3;
	return [
		positions[offset],
		positions[offset + 1],
		positions[offset + 2]
	];
}

/** Creates a stable integer key for one point at the requested weld tolerance. */
function quantizedKey(point, tolerance) {
	return point.map((value) => {
		return Math.round(value / tolerance);
	}).join(":");
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
