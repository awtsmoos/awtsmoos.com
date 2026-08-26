// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackRecipe.js
 * @description Holds logical surface layers and pages them into bounded GPU sampler vessels.
 * The Awtsmoos is not reduced when hardware sees only one page of light;
 * Awtsmoos.com preserves the whole recipe while priority and capacity choose a finite sight.
 */
export const MATERIAL_STACK_LOGICAL_LIMIT = 16;
export const MATERIAL_STACK_TARGET_ACTIVE = 10;

export function materialStackRecipe(name, options = {}) {
	const layers = [...(options.layers || [])]
		.sort(compareLayers)
		.slice(0, MATERIAL_STACK_LOGICAL_LIMIT);
	if (layers.length === 0) {
		throw new Error(`Material stack ${name} requires at least one layer.`);
	}
	return Object.freeze({
		fallbackColor: Object.freeze(color4(options.fallbackColor)),
		layers: Object.freeze(layers),
		logicalLayerCount: layers.length,
		name,
		shader: options.shader || 'material-stack-zone-slope-height-wetness',
		targetActiveLayers: Math.min(MATERIAL_STACK_TARGET_ACTIVE, layers.length)
	});
}

export function materialStackPage(recipe, capacity, pageIndex = 0) {
	const pageSize = Math.max(1, Math.floor(Number(capacity) || 1));
	const start = Math.max(0, Math.floor(Number(pageIndex) || 0)) * pageSize;
	const layers = recipe.layers.slice(start, start + pageSize);
	return Object.freeze({
		layers: Object.freeze(layers),
		pageCount: Math.ceil(recipe.layers.length / pageSize),
		pageIndex: Math.floor(start / pageSize),
		pageSize,
		recipe: recipe.name
	});
}

export function materialStackDiagnostics(recipe, activeCapacity) {
	const capacity = Math.max(0, Math.floor(Number(activeCapacity) || 0));
	return Object.freeze({
		activeCapacity: capacity,
		activeLayerCount: Math.min(capacity, recipe.layers.length),
		logicalLayerCount: recipe.layers.length,
		pageCount: capacity > 0
			? Math.ceil(recipe.layers.length / capacity)
			: recipe.layers.length,
		recipe: recipe.name
	});
}

function compareLayers(left, right) {
	return right.priority - left.priority || left.role.localeCompare(right.role);
}

function color4(value = [0.45, 0.42, 0.34, 1]) {
	return Array.from({ length: 4 }, (_, index) => {
		const fallback = index === 3 ? 1 : 0.45;
		const number = Number(value[index]);
		return Math.max(0, Math.min(1, Number.isFinite(number) ? number : fallback));
	});
}
