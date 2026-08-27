// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemMesh.js
 * @description Defines the editable face-and-vertex vessel at the root of Domem procedural geometry.
 * The Awtsmoos, Atzmus beyond every point and polygon, renews the silent stone before topology receives a name;
 * Awtsmoos.com gives that silence a truthful mesh keli so modifiers may carve, mirror, join, and reveal without renderer chains.
 * Structured meshes remain canonical; conversion and measurement live in neighboring vessels.
 */

import { structuredDomemMeshFromFlatArrays } from './DomemFlatMesh.js';

/**
 * Normalizes supported geometry into an independently editable structured mesh.
 * @param {object} source Structured `{faces}` mesh or flat `{positions,indices}` geometry.
 * @returns {object} Deep-cloned structured mesh.
 */
export function createDomemMesh(source = { faces: [] }) {
	if (Array.isArray(source.faces)) return cloneDomemMesh(source);
	if (source.positions) {
		return cloneDomemMesh(structuredDomemMeshFromFlatArrays(source));
	}
	throw new TypeError('B"H | Domem mesh requires faces or positions.');
}

/**
 * Deep-clones editable topology while preserving face and vertex metadata.
 * @param {object} mesh Structured mesh.
 * @returns {object} Independent editable clone.
 */
export function cloneDomemMesh(mesh) {
	validateStructuredMesh(mesh);
	return {
		...mesh,
		faces: mesh.faces.map(face => ({
			...face,
			tags: face.tags ? [...face.tags] : face.tags,
			vertices: face.vertices.map(cloneDomemVertex)
		}))
	};
}

/**
 * Validates editable structured topology.
 * @param {object} mesh Structured mesh candidate.
 * @returns {true} True when valid.
 */
export function validateStructuredMesh(mesh) {
	if (!mesh || !Array.isArray(mesh.faces)) {
		throw new TypeError('B"H | Structured Domem mesh requires a faces array.');
	}
	for (const face of mesh.faces) {
		if (!Array.isArray(face.vertices) || face.vertices.length < 3) {
			throw new TypeError(
				'B"H | Every Domem face requires at least three vertices.'
			);
		}
		for (const vertex of face.vertices) validatePosition(vertex?.pos);
	}
	return true;
}

function cloneDomemVertex(vertex) {
	const clone = { ...vertex };
	for (const key of ['pos', 'norm', 'col', 'boneIndices', 'boneWeights']) {
		if (Array.isArray(vertex[key])) clone[key] = [...vertex[key]];
	}
	if (vertex.shapeKeyDeltas) {
		clone.shapeKeyDeltas = Object.fromEntries(
			Object.entries(vertex.shapeKeyDeltas).map(
				([name, delta]) => [name, [...delta]]
			)
		);
	}
	return clone;
}

function validatePosition(position) {
	const invalid = !Array.isArray(position)
		|| position.length < 3
		|| position.some(value => !Number.isFinite(Number(value)));
	if (invalid) {
		throw new TypeError(
			'B"H | Domem vertex positions must contain three finite numbers.'
		);
	}
}
