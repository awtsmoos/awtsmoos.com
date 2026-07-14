// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshRecipe.js
 * @description The MeshRecipe is a transparent vessel between language and
 * geometry. At Awtsmoos.com, the hidden intention becomes named structure,
 * so every later edit can reveal rather than obscure the originating thought.
 */

import { hashStableRecipeValue, stableRecipeJson } from './stableRecipeJson.js';

const DEFAULT_COLOR = [0.72, 0.72, 0.72, 1];

function finiteNumber(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function normalizeDimensions(dimensions = {}) {
	const scalar = finiteNumber(dimensions.size, 1);

	return {
		width: finiteNumber(dimensions.width, scalar),
		height: finiteNumber(dimensions.height, scalar),
		depth: finiteNumber(dimensions.depth, scalar)
	};
}

function normalizeDiagnostics(diagnostics = {}) {
	return {
		recognized: [...(diagnostics.recognized || [])],
		inferred: [...(diagnostics.inferred || [])],
		defaults: [...(diagnostics.defaults || [])],
		unknown: [...(diagnostics.unknown || [])],
		warnings: [...(diagnostics.warnings || [])],
		errors: [...(diagnostics.errors || [])]
	};
}

function recipeIdentityValue(recipe) {
	const metadata = { ...(recipe.metadata || {}) };
	delete metadata.sourceText;

	return {
		...recipe,
		id: undefined,
		diagnostics: undefined,
		metadata
	};
}

/**
 * Normalizes partial recipe input into the version-one public contract.
 *
 * @param {object} input Partial recipe.
 * @returns {object} Normalized recipe.
 */
export function createMeshRecipe(input = {}) {
	const color = input.materials?.[0]?.color || DEFAULT_COLOR;
	const recipe = {
		version: 1,
		id: input.id || '',
		seed: Math.trunc(finiteNumber(input.seed, 0)),
		style: input.style || 'neutral',
		category: input.category || 'box',
		generator: input.generator || 'primitive.box',
		dimensions: normalizeDimensions(input.dimensions),
		materials: [{ id: 'primary', color: [...color] }],
		parts: input.parts || [{ id: 'body', role: 'primary-volume' }],
		operations: input.operations || [],
		quality: input.quality || 'medium',
		lods: input.lods || [{ level: 0, ratio: 1 }],
		collision: input.collision || { enabled: true, type: 'aabb' },
		anchors: input.anchors || [],
		semantics: input.semantics || { kind: 'solid-volume' },
		policies: input.policies || { deterministic: true },
		metadata: input.metadata || {},
		diagnostics: normalizeDiagnostics(input.diagnostics)
	};

	recipe.id ||= `mesh-${hashMeshRecipe(recipe)}`;
	return recipe;
}

/** @param {object} recipe Recipe to hash. @returns {string} Stable hash. */
export function hashMeshRecipe(recipe) {
	return hashStableRecipeValue(recipeIdentityValue(recipe));
}

/** @param {object} recipe Recipe to validate. @returns {{valid:boolean, issues:string[]}} */
export function validateMeshRecipe(recipe) {
	const issues = [];

	if (recipe?.version !== 1) {
		issues.push('Recipe version must be 1.');
	}

	for (const axis of ['width', 'height', 'depth']) {
		if (!(recipe?.dimensions?.[axis] > 0)) {
			issues.push(`${axis} must be greater than zero.`);
		}
	}

	if (!recipe?.generator) {
		issues.push('A generator id is required.');
	}

	return { valid: issues.length === 0, issues };
}

/** @param {object} recipe Recipe to serialize. @returns {string} Stable JSON. */
export function serializeMeshRecipe(recipe) {
	return stableRecipeJson(createMeshRecipe(recipe));
}

/** @param {string} text Serialized recipe. @returns {object} Normalized recipe. */
export function deserializeMeshRecipe(text) {
	return createMeshRecipe(JSON.parse(text));
}
