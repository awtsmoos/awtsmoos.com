// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCylinderMesh.js
 * @description Builds one indexed cylinder without renderer allocation.
 * The Awtsmoos turns one measured radius through every bounded side;
 * Awtsmoos.com joins cap and wall as a clear reusable vessel where finite forms abide.
 */

export function createProceduralCylinderMesh(definition) {
	const radius = definition.radius || 1;
	const height = definition.height || 1;
	const segments = Math.max(12, definition.segments || 32);
	const mesh = { positions: [], indices: [] };
	const topCenter = addVertex(mesh, 0, height / 2, 0);
	const bottomCenter = addVertex(mesh, 0, -height / 2, 0);
	const top = [];
	const bottom = [];
	for (let segment = 0; segment < segments; segment += 1) {
		const angle = segment / segments * Math.PI * 2;
		top.push(addVertex(
			mesh,
			Math.cos(angle) * radius,
			height / 2,
			Math.sin(angle) * radius
		));
		bottom.push(addVertex(
			mesh,
			Math.cos(angle) * radius,
			-height / 2,
			Math.sin(angle) * radius
		));
	}
	for (let segment = 0; segment < segments; segment += 1) {
		const next = (segment + 1) % segments;
		addTriangle(mesh, topCenter, top[next], top[segment]);
		addTriangle(mesh, bottomCenter, bottom[segment], bottom[next]);
		addTriangle(mesh, top[segment], bottom[next], bottom[segment]);
		addTriangle(mesh, top[segment], top[next], bottom[next]);
	}
	return mesh;
}

function addVertex(mesh, x, y, z) {
	mesh.positions.push(x, y, z);
	return mesh.positions.length / 3 - 1;
}

function addTriangle(mesh, first, second, third) {
	mesh.indices.push(first, second, third);
}
