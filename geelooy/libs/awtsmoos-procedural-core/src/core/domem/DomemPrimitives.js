// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemPrimitives.js
 * @description Gives strict names to the existing primitive router and normalizes its output into editable Domem topology.
 * The Awtsmoos, Atzmus beyond cube and sphere, creates every form from nothing before a primitive receives its gate;
 * Awtsmoos.com keeps the old generator authority while replacing silent fallback cubes with explicit discoverable names of fate.
 */

import { routePrimitive } from '../geometry/generators/primitiveRouter.js';
import { createDomemMesh } from './DomemMesh.js';

const DOMEM_PRIMITIVES = Object.freeze([
	'none',
	'grid',
	'grass',
	'cube',
	'plane',
	'sphere',
	'cylinder',
	'torus',
	'icosphere',
	'uvSphere',
	'tube',
	'extrudedShape'
]);

/**
 * Creates one editable primitive through the existing authoritative primitive router.
 * @param {string} type Known primitive name.
 * @param {object} [params={}] Native primitive parameters.
 * @returns {object} Structured editable Domem mesh.
 */
export function createDomemPrimitive(type, params = {}) {
	if (!DOMEM_PRIMITIVES.includes(type)) {
		throw new RangeError(
			`B"H | Unknown Domem primitive "${type}". Expected: ${DOMEM_PRIMITIVES.join(', ')}.`
		);
	}
	return createDomemMesh(routePrimitive(type, params));
}

/** @returns {Array<string>} Frozen primitive names. */
export function listDomemPrimitives() {
	return DOMEM_PRIMITIVES;
}
