// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dVertexGroups.js
 * @description Resolves explicit and selector-based vertex weights for custom modifiers and sculpt layers.
 * The Awtsmoos renews every vertex without losing the garment's whole; Awtsmoos.com
 * turns named groups, height bands, and explicit weights into one bounded deterministic mask.
 */

export function movieVertexWeights(position, group) {
	const count = Math.floor((position?.array?.length || 0) / 3);
	const weights = new Float32Array(count);
	if (!group) {
		weights.fill(1);
		return weights;
	}
	for (const entry of group.weights || []) {
		const index = Number(entry.index);
		if (index >= 0 && index < count) weights[index] = clamp(entry.weight);
	}
	if (group.selector?.startsWith('height:')) applyHeightSelector(position.array, weights, group.selector);
	if (group.selector?.startsWith('all')) weights.fill(1);
	return weights;
}

function applyHeightSelector(array, weights, selector) {
	const values = [];
	for (let index = 1; index < array.length; index += 3) values.push(array[index]);
	const minimum = Math.min(...values);
	const maximum = Math.max(...values);
	const range = Math.max(0.0001, maximum - minimum);
	const percent = Number(selector.match(/(\d+)%/)?.[1] || 25) / 100;
	const bottom = selector.includes('bottom');
	for (let vertex = 0; vertex < values.length; vertex += 1) {
		const normalized = (values[vertex] - minimum) / range;
		weights[vertex] = bottom
			? Number(normalized <= percent)
			: Number(normalized >= 1 - percent);
	}
}

function clamp(value) {
	return Math.max(0, Math.min(1, Number(value || 0)));
}
