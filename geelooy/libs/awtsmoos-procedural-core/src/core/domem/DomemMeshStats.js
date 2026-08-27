// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemMeshStats.js
 * @description Measures editable topology without making the Domem mesh vessel carry observational responsibility.
 * The Awtsmoos, Atzmus beyond every count, creates the silent form before face or vertex can be numbered;
 * Awtsmoos.com lets those finite measurements become evidence for pipelines while the mesh itself remains a simple structural chamber.
 */

import { validateStructuredMesh } from './DomemMesh.js';

/**
 * Returns stable topology evidence without mutating the mesh.
 * @param {object} mesh Structured editable mesh.
 * @returns {object} Frozen face, vertex-slot, unique-position, and triangle-equivalent counts.
 */
export function domemMeshStats(mesh) {
	validateStructuredMesh(mesh);
	const positions = new Set();
	let triangleEquivalent = 0;
	let vertexSlots = 0;
	for (const face of mesh.faces) {
		vertexSlots += face.vertices.length;
		triangleEquivalent += Math.max(0, face.vertices.length - 2);
		for (const vertex of face.vertices) {
			positions.add(positionKey(vertex.pos));
		}
	}
	return Object.freeze({
		faces: mesh.faces.length,
		triangleEquivalent,
		uniquePositions: positions.size,
		vertexSlots
	});
}

function positionKey(position) {
	return position
		.slice(0, 3)
		.map(value => Number(value).toFixed(7))
		.join(':');
}
