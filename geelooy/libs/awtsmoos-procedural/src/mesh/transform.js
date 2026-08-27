// B"H

/**
 * Chapter 2 — A finite vessel may turn through every axis while its source
 * remains untouched. Scale, rotation, and translation are applied in that order.
 */
export function transformMesh(mesh, options = {}) {
	const scale = axis(options.scale, 1);
	const rotate = axis(options.rotate, 0);
	const translate = axis(options.translate, 0);
	const positions = [];
	for (let index = 0; index < (mesh.positions || []).length; index += 3) {
		const point = [
			mesh.positions[index] * scale[0],
			mesh.positions[index + 1] * scale[1],
			mesh.positions[index + 2] * scale[2]
		];
		const turned = rotatePoint(point, rotate);
		positions.push(turned[0] + translate[0], turned[1] + translate[1], turned[2] + translate[2]);
	}
	return copyMesh(mesh, positions);
}

export function recolorMesh(mesh, color = [1, 1, 1, 1]) {
	return {
		...mesh,
		positions: [...(mesh.positions || [])],
		indices: [...(mesh.indices || [])],
		colors: Array.from({ length: (mesh.positions || []).length / 3 }, () => color).flat()
	};
}

export function mergeMeshes(meshes = []) {
	const output = { positions: [], indices: [], colors: [] };
	for (const current of meshes.flat(Infinity).filter(Boolean)) mergeInto(output, current);
	return output;
}

export function cloneMesh(mesh) {
	return copyMesh(mesh, [...(mesh.positions || [])]);
}

function rotatePoint([x, y, z], [rx, ry, rz]) {
	const cx = Math.cos(rx);
	const sx = Math.sin(rx);
	const cy = Math.cos(ry);
	const sy = Math.sin(ry);
	const cz = Math.cos(rz);
	const sz = Math.sin(rz);
	const xTurn = [x, y * cx - z * sx, y * sx + z * cx];
	const yTurn = [xTurn[0] * cy + xTurn[2] * sy, xTurn[1], -xTurn[0] * sy + xTurn[2] * cy];
	return [yTurn[0] * cz - yTurn[1] * sz, yTurn[0] * sz + yTurn[1] * cz, yTurn[2]];
}

function copyMesh(mesh, positions) {
	return {
		...mesh,
		positions,
		indices: [...(mesh.indices || [])],
		colors: normalizedColors(mesh)
	};
}

function normalizedColors(mesh) {
	const count = (mesh.positions || []).length / 3;
	if (mesh.colors?.length === count * 4) return [...mesh.colors];
	return Array.from({ length: count }, () => [1, 1, 1, 1]).flat();
}

function mergeInto(output, mesh) {
	const offset = output.positions.length / 3;
	output.positions.push(...(mesh.positions || []));
	output.indices.push(...(mesh.indices || []).map(index => index + offset));
	output.colors.push(...normalizedColors(mesh));
}

function axis(value, fallback) {
	if (Array.isArray(value)) return [0, 1, 2].map(index => finite(value[index], fallback));
	const scalar = finite(value, fallback);
	return [scalar, scalar, scalar];
}

function finite(value, fallback) {
	return Number.isFinite(value) ? value : fallback;
}
