// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemMirrorModifier.js
 * @description Reflects editable topology as real geometry, correcting positions, normals, and face winding.
 * The Awtsmoos, Atzmus beyond right and left, creates symmetry without becoming either side of the plane;
 * Awtsmoos.com lets reflection become topology rather than a negative-scale illusion, so later modifiers inherit an honest chain.
 */

import { cloneDomemMesh } from './DomemMesh.js';
import { weldDomemMeshByPosition } from './DomemWeld.js';

const AXIS_INDEX = Object.freeze({ x: 0, y: 1, z: 2 });

/**
 * Mirrors structured geometry across an axis-aligned plane.
 * @param {object} mesh Structured editable mesh.
 * @param {object} [options={}] Axis, plane offset, include-original, weld, and weld-epsilon options.
 * @returns {object} New mirrored structured mesh.
 */
export function mirrorDomemMesh(mesh, options = {}) {
	const axis = String(options.axis ?? 'x').toLowerCase();
	const axisIndex = AXIS_INDEX[axis];
	if (axisIndex === undefined) {
		throw new RangeError('B"H | Domem mirror axis must be x, y, or z.');
	}
	const offset = finite(options.offset, 0);
	const source = cloneDomemMesh(mesh);
	const mirrored = cloneDomemMesh(mesh);
	for (const face of mirrored.faces) {
		for (const vertex of face.vertices) {
			vertex.pos[axisIndex] = offset * 2 - vertex.pos[axisIndex];
			if (vertex.norm) vertex.norm[axisIndex] *= -1;
		}
		face.vertices.reverse();
	}
	const result = options.includeOriginal === false
		? mirrored
		: { ...source, faces: [...source.faces, ...mirrored.faces] };
	if (options.weld === false) return result;
	return weldDomemMeshByPosition(result, {
		epsilon: finite(options.weldEpsilon, 1e-6)
	});
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
