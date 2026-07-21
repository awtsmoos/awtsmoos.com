// B"H

import { canonicalEdgeKey } from "./triangleGeometry.js";

function addEdge(records, left, right, faceIndex) {
	const key = canonicalEdgeKey(left, right);
	const record = records.get(key) ?? {
		key,
		vertices: left < right ? [left, right] : [right, left],
		faces: []
	};
	record.faces.push(faceIndex);
	records.set(key, record);
}

/** Builds sorted immutable edge-to-face incidence records. */
export function buildEdgeIncidence(indices) {
	const records = new Map();
	for (let offset = 0; offset < indices.length; offset += 3) {
		const faceIndex = offset / 3;
		const a = indices[offset];
		const b = indices[offset + 1];
		const c = indices[offset + 2];
		addEdge(records, a, b, faceIndex);
		addEdge(records, b, c, faceIndex);
		addEdge(records, c, a, faceIndex);
	}
	return Object.freeze([...records.values()]
		.sort((left, right) => left.key < right.key ? -1 : 1)
		.map(record => Object.freeze({
			key: record.key,
			vertices: Object.freeze(record.vertices),
			faces: Object.freeze(record.faces.sort((left, right) => left - right))
		})));
}

/** Finds connected face components through shared triangle edges. */
export function buildFaceComponents(faceCount, edgeRecords) {
	const adjacency = Array.from({ length: faceCount }, () => new Set());
	for (const edge of edgeRecords) {
		for (const left of edge.faces) {
			for (const right of edge.faces) {
				if (left !== right) adjacency[left].add(right);
			}
		}
	}
	const visited = new Set();
	const components = [];
	for (let seed = 0; seed < faceCount; seed += 1) {
		if (visited.has(seed)) continue;
		const queue = [seed];
		const faces = [];
		visited.add(seed);
		while (queue.length) {
			const face = queue.shift();
			faces.push(face);
			for (const neighbor of [...adjacency[face]].sort((a, b) => a - b)) {
				if (!visited.has(neighbor)) {
					visited.add(neighbor);
					queue.push(neighbor);
				}
			}
		}
		components.push(Object.freeze(faces.sort((a, b) => a - b)));
	}
	return Object.freeze(components);
}
