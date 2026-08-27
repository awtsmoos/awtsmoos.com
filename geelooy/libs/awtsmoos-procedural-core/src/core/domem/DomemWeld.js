// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemWeld.js
 * @description Shares vertex objects at coincident positions so seams may become one editable topological boundary.
 * The Awtsmoos, Atzmus beyond separation and union, renews two apparent points from one indivisible source;
 * Awtsmoos.com lets Domem weld reflected or repeated vessels without forcing a renderer, index buffer, or scene-object course.
 */

import { cloneDomemMesh } from './DomemMesh.js';

/**
 * Welds vertex references by quantized position while preserving face records and first-seen attributes.
 * @param {object} mesh Structured editable mesh.
 * @param {object} [options={}] Numeric weld epsilon.
 * @returns {object} New structured mesh with shared coincident vertex objects.
 */
export function weldDomemMeshByPosition(mesh, options = {}) {
	const epsilon = Math.max(1e-12, Number(options.epsilon) || 1e-6);
	const result = cloneDomemMesh(mesh);
	const canonical = new Map();
	for (const face of result.faces) {
		face.vertices = face.vertices.map(vertex => {
			const key = vertex.pos.map(value => Math.round(Number(value) / epsilon)).join(':');
			const existing = canonical.get(key);
			if (existing) return existing;
			canonical.set(key, vertex);
			return vertex;
		});
	}
	return result;
}
