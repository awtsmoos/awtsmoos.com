// B"H
/**
 * @file treeValidation.js
 * @description Structural proof helpers for procedural tree geometry.
 */
function finite(values) {
	return Array.isArray(values) && values.every(Number.isFinite);
}

function geometryIssues(label, geometry, allowEmpty = false) {
	const issues = [];
	const vertexCount = geometry.positions.length / 3;
	if (!allowEmpty && geometry.positions.length === 0) issues.push(`${label}:empty`);
	if (!finite(geometry.positions)) issues.push(`${label}:positions-not-finite`);
	if (!finite(geometry.normals)) issues.push(`${label}:normals-not-finite`);
	if (!finite(geometry.uvs)) issues.push(`${label}:uvs-not-finite`);
	if (geometry.positions.length % 3 !== 0) issues.push(`${label}:position-stride`);
	if (geometry.normals.length !== geometry.positions.length) issues.push(`${label}:normal-count`);
	if (geometry.uvs.length !== vertexCount * 2) issues.push(`${label}:uv-count`);
	if (!geometry.indices.every((index) => (
		Number.isInteger(index) && index >= 0 && index < vertexCount
	))) issues.push(`${label}:index-range`);
	return issues;
}

function geometryBounds(positions) {
	const min = [Infinity, Infinity, Infinity];
	const max = [-Infinity, -Infinity, -Infinity];
	for (let index = 0; index < positions.length; index += 3) {
		for (let axis = 0; axis < 3; axis += 1) {
			min[axis] = Math.min(min[axis], positions[index + axis]);
			max[axis] = Math.max(max[axis], positions[index + axis]);
		}
	}
	return { min, max };
}

export function validateTreeProceduralData(tree) {
	const dead = tree.preset === 'Dead Tree';
	const issues = [
		...geometryIssues('branches', tree.branches),
		...geometryIssues('leaves', tree.leaves, dead)
	];
	if (!finite(tree.leaves.colors)) issues.push('leaves:colors-not-finite');
	if (tree.leaves.colors.length !== tree.leaves.positions.length / 3 * 4) {
		issues.push('leaves:color-count');
	}
	const allPositions = tree.branches.positions.concat(tree.leaves.positions);
	const bounds = geometryBounds(allPositions);
	const height = bounds.max[1] - bounds.min[1];
	if (!Number.isFinite(height) || height <= 0) issues.push('bounds:invalid-height');
	return {
		ok: issues.length === 0,
		issues,
		bounds,
		height,
		stats: tree.stats
	};
}

export default validateTreeProceduralData;
