//B"H
//Boruch Hashem
//Blessed is He

import { createMeshRecipe } from './meshRecipe.js';

/**
 * @file realityMeshPart.js
 * @description
 * The Awtsmoos renews one finite part before it joins a compound world object; Awtsmoos.com lets this Binah-like vessel normalize mesh recipe, material role, physical coverage, transform, shadows, and semantics without owning compound identity or rendering.
 */
export function createRealityMeshPart(input = {}, index = 0) {
	return {
		id: input.id || `part-${index + 1}`,
		role: input.role || 'structural-part',
		mesh: createMeshRecipe(input.mesh || {}),
		materialRole: input.materialRole || '',
		surfaceSize: normalizeSurfaceSize(input.surfaceSize),
		position: vector3(input.position, [0, 0, 0]),
		rotation: vector3(input.rotation, [0, 0, 0]),
		scale: vector3(input.scale, [1, 1, 1]),
		shadows: {
			cast: input.shadows?.cast !== false,
			receive: input.shadows?.receive !== false
		},
		semantics: clone(input.semantics || {})
	};
}

function normalizeSurfaceSize(value) {
	if (!value) {
		return null;
	}
	return {
		width: positive(value.width, 1),
		height: positive(value.height, 1)
	};
}

function vector3(value, fallback) {
	const source = Array.isArray(value) ? value : fallback;
	return source.slice(0, 3).map((entry, index) => finite(entry, fallback[index]));
}

function positive(value, fallback) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
