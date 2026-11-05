// B"H
// Boruch Hashem
// Blessed is He

/** @file WorldAssetRecipe.js @description Versioned JSON contract for every world asset generator. */
const SUPPORTED_TYPES = Object.freeze([
	'botanical.plant',
	'environment.river',
	'environment.well',
	'material.water',
	'mesh.recipe',
	'mesh.text',
	'terrain.marching-cubes'
]);

export function normalizeWorldAssetRecipe(source = {}) {
	const recipe = JSON.parse(JSON.stringify(source));
	recipe.version = Number(recipe.version || 1);
	recipe.id = String(recipe.id || `${recipe.type || 'asset'}-${recipe.seed || 613}`);
	recipe.seed = Number.isFinite(Number(recipe.seed)) ? Number(recipe.seed) : 613;
	recipe.options = recipe.options && typeof recipe.options === 'object' ? recipe.options : {};
	recipe.material = recipe.material && typeof recipe.material === 'object' ? recipe.material : null;
	recipe.uv = recipe.uv && typeof recipe.uv === 'object' ? recipe.uv : { mode: 'planar', scale: 1 };
	return recipe;
}

export function validateWorldAssetRecipe(source) {
	const recipe = normalizeWorldAssetRecipe(source);
	const issues = [];
	if (recipe.version !== 1) issues.push('Only world asset recipe version 1 is supported.');
	if (!SUPPORTED_TYPES.includes(recipe.type)) issues.push(`Unsupported world asset type: ${recipe.type}`);
	if (!recipe.id || recipe.id.length > 128) issues.push('Asset id must contain 1-128 characters.');
	if (!Number.isSafeInteger(recipe.seed)) issues.push('Asset seed must be a safe integer.');
	return { issues, ok: issues.length === 0, recipe };
}

export function requireWorldAssetRecipe(source) {
	const validation = validateWorldAssetRecipe(source);
	if (!validation.ok) throw new Error(`Invalid world asset recipe: ${validation.issues.join(' ')}`);
	return validation.recipe;
}

export { SUPPORTED_TYPES };
