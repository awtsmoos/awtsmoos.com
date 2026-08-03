// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralPrimitiveMeshes.js
 * @description Creates local-space primitive and authored manual meshes without renderer allocation.
 * The Awtsmoos gives point, face, UV, and color one measured source;
 * Awtsmoos.com preserves multicolor flowers and every bounded procedural course.
 */

import { cubeMesh, sphereMesh } from '../../../../../../libs/awtsmoos-procedural/src/index.js';
import { createBooleanDoorwayMesh } from './BooleanDoorwayGeometry.js';

export function createPrimitiveMesh(definition) {
	if (definition.shape === 'manual') return manualMesh(definition);
	if (definition.shape === 'doorway') return createBooleanDoorwayMesh(definition);
	if (definition.shape === 'cylinder') return createCylinderMesh(definition);
	if (definition.shape === 'triPrism') return createTriPrismMesh(definition);
	if (definition.shape === 'sphere') {
		return sphereMesh({
			color: definition.rgba,
			radius: definition.radius || 1,
			rings: 10,
			segments: 20
		});
	}
	return cubeMesh({
		color: definition.rgba || [0.7, 0.7, 0.7, 1],
		size: [1, 1, 1]
	});
}

export function manualMesh({ vertices = [], faces = [], indices = [], uvs = [], colors = [] }) {
	return {
		colors: normalizeColors(colors, vertices.length),
		indices: indices.length ? [...indices] : faces.flatMap(triangulateFace),
		positions: vertices.flatMap(toPointArray),
		uvs: uvs.length === vertices.length * 2 ? [...uvs] : null
	};
}

function createTriPrismMesh(definition) {
	const size = definition.size || { x: 2, y: 1, z: 0.4 };
	const halfX = size.x / 2;
	const halfY = size.y / 2;
	const halfZ = size.z / 2;
	return manualMesh({
		vertices: [
			[-halfX, -halfY, halfZ], [halfX, -halfY, halfZ], [0, halfY, halfZ],
			[-halfX, -halfY, -halfZ], [halfX, -halfY, -halfZ], [0, halfY, -halfZ]
		],
		faces: [[0, 1, 2], [4, 3, 5], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]]
	});
}

function createCylinderMesh(definition) {
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
		top.push(addVertex(mesh, Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius));
		bottom.push(addVertex(mesh, Math.cos(angle) * radius, -height / 2, Math.sin(angle) * radius));
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

function normalizeColors(colors, vertexCount) {
	if (!Array.isArray(colors) || !colors.length) return [];
	const flat = colors.flatMap(value => Array.isArray(value) ? value : [value]);
	return flat.length === vertexCount * 4 ? flat : [];
}

function toPointArray(value) {
	return Array.isArray(value) ? [value[0], value[1], value[2]] : [value.x || 0, value.y || 0, value.z || 0];
}

function triangulateFace(face) {
	const triangles = [];
	for (let index = 1; index < face.length - 1; index += 1) triangles.push(face[0], face[index], face[index + 1]);
	return triangles;
}

function addVertex(mesh, x, y, z) {
	mesh.positions.push(x, y, z);
	return mesh.positions.length / 3 - 1;
}

function addTriangle(mesh, first, second, third) {
	mesh.indices.push(first, second, third);
}
