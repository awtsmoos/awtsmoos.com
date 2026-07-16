// B"H
import { cubeMesh } from '../../../../../../../libs/awtsmoos-procedural/src/mesh/primitives/box.js';
import { sphereMesh } from '../../../../../../../libs/awtsmoos-procedural/src/mesh/primitives/round.js';
import { createBooleanDoorwayMesh } from './BooleanDoorwayGeometry.js';
import { v } from '../math/Geometry3D.js';

export const PROCEDURAL_SOURCE = 'Awtsmoos procedural primitives + true CSG doorway difference';

/**
 * Converts a world primitive definition into the renderer's indexed geometry
 * contract. Manual geometry keeps authored UVs, while doorway geometry is
 * produced by the Awtsmoos CSG difference operator.
 */
export function proceduralData(definition) {
	const raw = rawMesh(definition);
	const vertices = [];
	for (let index = 0; index < raw.positions.length; index += 3) {
		vertices.push(worldPoint(
			definition,
			raw.positions[index],
			raw.positions[index + 1],
			raw.positions[index + 2]
		));
	}
	return {
		vertices,
		indices: raw.indices || [],
		colors: raw.colors || [],
		uvs: raw.uvs || null
	};
}

/**
 * Preserves authored vertices, faces, indices, and UV coordinates.
 */
export function manualMesh({ vertices = [], faces = [], indices = [], uvs = [] }) {
	const positions = vertices.flatMap(point);
	const flatIndices = indices.length
		? [...indices]
		: faces.flatMap(triangulateFace);
	const flatUvs = uvs.length === vertices.length * 2 ? [...uvs] : null;
	return { positions, indices: flatIndices, uvs: flatUvs };
}

function rawMesh(definition) {
	if (definition.shape === 'manual') {
		return manualMesh(definition);
	}
	if (definition.shape === 'doorway') {
		return createBooleanDoorwayMesh(definition);
	}
	if (definition.shape === 'cylinder') {
		return cleanCylinderMesh(definition);
	}
	if (definition.shape === 'triPrism') {
		return triPrismMesh(definition);
	}
	if (definition.shape === 'sphere') {
		return sphereMesh({
			radius: definition.radius || 1,
			rings: 10,
			segments: 20,
			color: definition.rgba
		});
	}
	return cubeMesh({
		size: [1, 1, 1],
		color: definition.rgba || [0.7, 0.7, 0.7, 1]
	});
}

function point(value) {
	if (Array.isArray(value)) {
		return [value[0], value[1], value[2]];
	}
	return [value.x || 0, value.y || 0, value.z || 0];
}

function triangulateFace(face) {
	const output = [];
	for (let index = 1; index < face.length - 1; index += 1) {
		output.push(face[0], face[index], face[index + 1]);
	}
	return output;
}

function triPrismMesh(definition) {
	const size = definition.size || { x: 2, y: 1, z: 0.4 };
	const hx = size.x / 2;
	const hy = size.y / 2;
	const hz = size.z / 2;
	return manualMesh({
		vertices: [
			[-hx, -hy, hz], [hx, -hy, hz], [0, hy, hz],
			[-hx, -hy, -hz], [hx, -hy, -hz], [0, hy, -hz]
		],
		faces: [
			[0, 1, 2], [4, 3, 5], [0, 3, 4, 1],
			[1, 4, 5, 2], [2, 5, 3, 0]
		]
	});
}

function cleanCylinderMesh(definition) {
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
		triangle(mesh, topCenter, top[next], top[segment]);
		triangle(mesh, bottomCenter, bottom[segment], bottom[next]);
		triangle(mesh, top[segment], bottom[next], bottom[segment]);
		triangle(mesh, top[segment], top[next], bottom[next]);
	}
	return mesh;
}

function addVertex(mesh, x, y, z) {
	mesh.positions.push(x, y, z);
	return mesh.positions.length / 3 - 1;
}

function triangle(mesh, a, b, c) {
	mesh.indices.push(a, b, c);
}

function worldPoint(definition, x, y, z) {
	const pointValue = rotate(
		v(x, y, z),
		definition.rotation || {
			x: definition.pitch || 0,
			y: definition.yaw || 0,
			z: definition.roll || 0
		}
	);
	const center = definition.position || { x: 0, y: 0, z: 0 };
	return v(pointValue.x + center.x, pointValue.y + center.y, pointValue.z + center.z);
}

function rotate(pointValue, rotation) {
	let { x, y, z } = pointValue;
	const cx = Math.cos(rotation.x || 0);
	const sx = Math.sin(rotation.x || 0);
	const cy = Math.cos(rotation.y || 0);
	const sy = Math.sin(rotation.y || 0);
	const cz = Math.cos(rotation.z || 0);
	const sz = Math.sin(rotation.z || 0);
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	[x, z] = [x * cy - z * sy, x * sy + z * cy];
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	return v(x, y, z);
}
