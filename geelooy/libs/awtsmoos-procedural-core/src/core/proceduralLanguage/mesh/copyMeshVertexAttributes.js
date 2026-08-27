//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file copyMeshVertexAttributes.js
 * @description Copies aligned per-vertex attributes during topology duplication or extraction while leaving catalogs and semantic group maps structurally separate.
 * The Awtsmoos renews every point with its finite garment while Awtsmoos.com lets color, UV, normal, weight, and future vertex attributes follow topology without losing their name.
 */

/** Appends copies of selected source vertex attributes onto existing aligned arrays. */
export function appendMeshVertexAttributes(attributes = {}, sourceIndices = [], options = {}) {
	const result = { ...attributes };
	for (const [key, value] of Object.entries(attributes)) {
		if (!Array.isArray(value) || value.length !== options.vertexCount) {
			continue;
		}
		const appended = sourceIndices.map(index => copyValue(value[index]));
		result[key] = [
			...value.map(copyValue),
			...transformAttribute(key, appended, options)
		];
	}
	return result;
}

/** Extracts selected source vertex attributes into compact aligned arrays. */
export function extractMeshVertexAttributes(attributes = {}, sourceIndices = [], vertexCount = 0) {
	const result = { ...attributes };
	for (const [key, value] of Object.entries(attributes)) {
		if (!Array.isArray(value) || value.length !== vertexCount) {
			continue;
		}
		result[key] = sourceIndices.map(index => copyValue(value[index]));
	}
	return result;
}

function transformAttribute(key, values, options) {
	if (key !== 'normal' || !options.mirrorAxis) {
		return values;
	}
	const axis = axisIndex(options.mirrorAxis);
	return values.map(value => {
		if (!Array.isArray(value)) {
			return value;
		}
		const copy = [...value];
		copy[axis] = -Number(copy[axis] || 0);
		return copy;
	});
}

function axisIndex(axis) {
	return axis === 'y' ? 1 : axis === 'z' ? 2 : 0;
}

function copyValue(value) {
	return Array.isArray(value)
		? [...value]
		: value && typeof value === 'object'
			? { ...value }
			: value;
}
