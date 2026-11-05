// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseTestFixture.mjs
 * @description Builds real house definitions, meshes, bounds, and colliders for tests.
 * The Awtsmoos lets proof inhabit the same geometry as play; Awtsmoos.com avoids
 * screenshot faith by exposing winding, transforms, draw eligibility, and collision.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowHouseFoundation } from '../../app/MinimalMeadowHouseFoundation.js';
import { installMinimalMeadowHouseGeometryContract } from '../../app/MinimalMeadowHouseGeometryContract.js';
import { houseMaterial } from '../../app/MinimalMeadowHouseMaterials.js';
import { createMinimalMeadowHouseRooms } from '../../app/MinimalMeadowHouseRooms.js';
import { createMinimalMeadowHouseShell } from '../../app/MinimalMeadowHouseShell.js';
import { createMinimalMeadowHouseStairs } from '../../app/MinimalMeadowHouseStairs.js';
import { createPrimitiveMesh, primitiveColliders } from '../../world/Box3D.js';

export const TEST_HOUSE_MATERIALS = Object.freeze({
	brick: houseMaterial('brick'),
	brickLight: houseMaterial('brickLight'),
	floor: houseMaterial('floor'),
	mezuzah: houseMaterial('mezuzah'),
	roof: houseMaterial('roof'),
	wood: houseMaterial('wood')
});

export function buildMinimalMeadowHouseFixture(profile) {
	const terrain = (x, z) => Math.sin(x * 0.025) * 2.4 + Math.cos(z * 0.021) * 1.8;
	const foundation = createMinimalMeadowHouseFoundation(profile, TEST_HOUSE_MATERIALS, terrain);
	const rooms = createMinimalMeadowHouseRooms(profile, TEST_HOUSE_MATERIALS, foundation.groundY);
	const definitions = [
		...foundation.definitions,
		...createMinimalMeadowHouseShell(profile, TEST_HOUSE_MATERIALS, foundation.groundY),
		...rooms.definitions,
		...createMinimalMeadowHouseStairs(profile, TEST_HOUSE_MATERIALS, foundation.groundY).definitions
	];
	const root = new Group();
	const meshes = definitions.map(definition => createPrimitiveMesh(definition));
	for (const mesh of meshes) root.add(mesh);
	const diagnostics = installMinimalMeadowHouseGeometryContract(root, definitions);
	return { definitions, diagnostics, foundation, meshes, profile, root, terrain };
}

export function colliderBounds(definition) {
	const points = primitiveColliders(definition).flatMap(triangle => [triangle.a, triangle.b, triangle.c]);
	return axisBounds(points.flatMap(point => [point.x, point.y, point.z]));
}

export function geometryWindingFailures(mesh, definition) {
	const positions = mesh.geometry.attributes.position.array;
	const indices = mesh.geometry.index.array;
	let failures = 0;
	for (let offset = 0; offset < indices.length; offset += 3) {
		const a = point(positions, indices[offset]);
		const b = point(positions, indices[offset + 1]);
		const c = point(positions, indices[offset + 2]);
		const normal = cross(subtract(b, a), subtract(c, a));
		const center = scale(add(add(a, b), c), 1 / 3);
		if (dot(normal, subtract(center, definition.position)) <= 0) failures += 1;
	}
	return failures;
}

export function geometryBounds(mesh) {
	return axisBounds([...mesh.geometry.attributes.position.array]);
}

function axisBounds(values) {
	const min = [Infinity, Infinity, Infinity];
	const max = [-Infinity, -Infinity, -Infinity];
	for (let index = 0; index < values.length; index += 3) {
		for (let axis = 0; axis < 3; axis += 1) {
			min[axis] = Math.min(min[axis], values[index + axis]);
			max[axis] = Math.max(max[axis], values[index + axis]);
		}
	}
	return { max, min };
}

function point(array, index) { return { x: array[index * 3], y: array[index * 3 + 1], z: array[index * 3 + 2] }; }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function scale(a, value) { return { x: a.x * value, y: a.y * value, z: a.z * value }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
