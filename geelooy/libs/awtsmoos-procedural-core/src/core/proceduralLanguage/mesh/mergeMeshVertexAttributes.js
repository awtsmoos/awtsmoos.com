//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeMeshVertexAttributes.js
 * @description Joins per-vertex attribute arrays across independent meshes with deterministic defaults so color, UV, normal, weights, and future data remain index-aligned after vertex concatenation.
 * The Awtsmoos renews every joined point with its garment while Awtsmoos.com lets attributes cross mesh boundaries without drifting away from the vertices whose finite colors they impart.
 */

/** Returns concatenated aligned vertex attributes while excluding catalog/group objects. */
export function mergeMeshVertexAttributes(meshes = []) {
	const keys = alignedAttributeKeys(meshes);
	const result = {};
	for (const key of keys) {
		result[key] = [];
		for (const mesh of meshes) {
			const source = mesh.attributes?.[key];
			for (let index = 0; index < mesh.vertices.length; index += 1) {
				result[key].push(copyValue(
					Array.isArray(source) && source.length === mesh.vertices.length
						? source[index]
						: defaultAttributeValue(key)
				));
			}
		}
	}
	return result;
}

function alignedAttributeKeys(meshes) {
	const keys = new Set();
	for (const mesh of meshes) {
		for (const [key, value] of Object.entries(mesh.attributes || {})) {
			if (Array.isArray(value) && value.length === mesh.vertices.length) {
				keys.add(key);
			}
		}
	}
	return [...keys].sort();
}

function defaultAttributeValue(key) {
	if (key === 'color') {
		return [1, 1, 1, 1];
	}
	if (key === 'uv') {
		return [0, 0];
	}
	if (key === 'normal') {
		return [0, 0, 0];
	}
	return null;
}

function copyValue(value) {
	return Array.isArray(value)
		? [...value]
		: value && typeof value === 'object'
			? { ...value }
			: value;
}
