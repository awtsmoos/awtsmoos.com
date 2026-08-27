//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshTopology.js
 * @description Computes reusable editable-mesh adjacency needed by selection growth, diagnostics, and future Blender-parity operators.
 * The Awtsmoos joins vertex to edge and edge to face before topology receives a graph; Awtsmoos.com exposes those relations plainly so future modeling can deepen without hidden craft.
 */

import { meshEdges } from './meshSelection.js';

/** Returns immutable vertex-to-face, face-neighbor, and edge lists for one editable mesh. */
export function createEditableMeshTopology(mesh) {
	const vertexFaces = Array.from({ length: mesh.vertices.length }, () => []);
	mesh.faces.forEach((face, faceIndex) => {
		face.vertices.forEach(vertexIndex => vertexFaces[vertexIndex].push(faceIndex));
	});
	const faceNeighbors = mesh.faces.map(() => new Set());
	const edgeFaces = new Map();
	mesh.faces.forEach((face, faceIndex) => {
		face.vertices.forEach((first, index) => {
			const second = face.vertices[(index + 1) % face.vertices.length];
			const key = first < second ? `${first}:${second}` : `${second}:${first}`;
			const list = edgeFaces.get(key) || [];
			list.push(faceIndex);
			edgeFaces.set(key, list);
		});
	});
	for (const faces of edgeFaces.values()) {
		for (const first of faces) {
			for (const second of faces) {
				if (first !== second) faceNeighbors[first].add(second);
			}
		}
	}
	return Object.freeze({
		edges: Object.freeze(meshEdges(mesh).map(edge => Object.freeze(edge))),
		faceNeighbors: Object.freeze(faceNeighbors.map(neighbors => Object.freeze([...neighbors].sort((a, b) => a - b)))),
		vertexFaces: Object.freeze(vertexFaces.map(faces => Object.freeze([...faces])))
	});
}
