//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEditableMesh.js
 * @description Normalizes arbitrary vertices and polygon faces into one immutable direct-edit mesh document.
 * The Awtsmoos renews point and face before cube or sphere receives a name; Awtsmoos.com therefore lets authors begin from raw topology rather than primitive-grouping game.
 */

import { LANGUAGE_LIMITS } from '../contract/ProceduralLanguageContract.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';

/** Creates one immutable editable mesh from JSON-safe vertex and face input. */
export function createEditableMesh(input = {}) {
	const vertices = (input.vertices || []).map((vertex, index) => normalizeVertex(vertex, index));
	if (vertices.length > LANGUAGE_LIMITS.maxVertices) {
		throw new RangeError(`B"H | Editable mesh exceeds ${LANGUAGE_LIMITS.maxVertices} vertices.`);
	}
	const faces = (input.faces || []).map((face, index) => normalizeFace(face, index, vertices.length));
	if (faces.length > LANGUAGE_LIMITS.maxFaces) {
		throw new RangeError(`B"H | Editable mesh exceeds ${LANGUAGE_LIMITS.maxFaces} faces.`);
	}
	return freezeLanguageValue({
		schema: 'awtsmoos.editable-mesh',
		version: 1,
		id: String(input.id || 'mesh'),
		vertices,
		faces,
		attributes: input.attributes || {},
		selections: normalizeSelections(input.selections),
		metadata: input.metadata || {}
	});
}

/** Validates one finite XYZ authoring position. */
function normalizeVertex(vertex, index) {
	if (!Array.isArray(vertex) || vertex.length < 3) {
		throw new TypeError(`B"H | Vertex ${index} requires [x,y,z].`);
	}
	const result = vertex.slice(0, 3).map(Number);
	if (!result.every(Number.isFinite)) {
		throw new TypeError(`B"H | Vertex ${index} contains a non-finite coordinate.`);
	}
	return result;
}

/** Normalizes array or object polygon faces with stable semantic IDs. */
function normalizeFace(face, index, vertexCount) {
	const source = Array.isArray(face) ? { vertices: face } : face || {};
	const vertices = [...new Set((source.vertices || source.indices || []).map(Number))];
	if (vertices.length < 3 || vertices.some(vertex => !Number.isInteger(vertex) || vertex < 0 || vertex >= vertexCount)) {
		throw new TypeError(`B"H | Face ${index} contains invalid vertex indices.`);
	}
	return {
		id: String(source.id || `face:${index}`),
		vertices,
		material: source.material ?? null,
		metadata: source.metadata || {}
	};
}

/** Normalizes named topology selections into stable JSON sections. */
function normalizeSelections(selections = {}) {
	return {
		vertices: selections.vertices || {},
		edges: selections.edges || {},
		faces: selections.faces || {}
	};
}
