//B"H
//Boruch Hashem
//Blessed is He

import { validateMeshRecipe } from './meshRecipe.js';
import { createRealityMeshPart } from './realityMeshPart.js';
import { hashStableRecipeValue, stableRecipeJson } from './stableRecipeJson.js';

/**
 * @file realityMeshRecipe.js
 * @description
 * The Awtsmoos renews many finite parts as one meaningful object; Awtsmoos.com lets this Tiferes-like recipe join procedural geometry, physical material roles, transforms, anchors, and semantics without hiding their boundaries.
 * MeshRecipe v1 remains the geometry covenant; this compound recipe owns composition identity, validation, and serialization only, never rendering or texture loading.
 */
export function createRealityMeshRecipe(input = {}) {
	const recipe = {
		version: 1,
		id: input.id || '',
		category: input.category || 'world-object',
		style: input.style || 'physical',
		seed: Math.trunc(finite(input.seed, 0)),
		parts: (input.parts || []).map(createRealityMeshPart),
		anchors: clone(input.anchors || []),
		collision: clone(input.collision || { enabled: true, type: 'compound' }),
		lods: clone(input.lods || [{ level: 0, ratio: 1 }]),
		semantics: clone(input.semantics || { kind: 'reality-object' }),
		metadata: clone(input.metadata || {})
	};
	if (!recipe.id) {
		recipe.id = `reality-${hashRealityMeshRecipe(recipe)}`;
	}
	return recipe;
}

/** @param {object} recipe Compound recipe. @returns {string} Stable identity hash. */
export function hashRealityMeshRecipe(recipe) {
	const identity = {
		...recipe,
		id: undefined
	};
	return hashStableRecipeValue(identity);
}

/** @param {object} recipe Compound recipe. @returns {{valid:boolean,issues:string[]}} Validation evidence. */
export function validateRealityMeshRecipe(recipe) {
	const issues = [];
	if (recipe?.version !== 1) {
		issues.push('Reality recipe version must be 1.');
	}
	if (!Array.isArray(recipe?.parts) || recipe.parts.length === 0) {
		issues.push('Reality recipe requires at least one part.');
	}
	for (const part of recipe?.parts || []) {
		const meshValidation = validateMeshRecipe(part.mesh);
		for (const issue of meshValidation.issues) {
			issues.push(`${part.id}: ${issue}`);
		}
		if (!part.materialRole) {
			issues.push(`${part.id}: materialRole is required.`);
		}
	}
	return {
		valid: issues.length === 0,
		issues
	};
}

/** @param {object} recipe Compound recipe. @returns {string} Stable JSON. */
export function serializeRealityMeshRecipe(recipe) {
	return stableRecipeJson(createRealityMeshRecipe(recipe));
}

/** @param {string} text Stable JSON. @returns {object} Normalized compound recipe. */
export function deserializeRealityMeshRecipe(text) {
	return createRealityMeshRecipe(JSON.parse(text));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
