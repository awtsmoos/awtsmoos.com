//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzFallbackBoxMesh.js
 * @description Builds UV-ready fallback cuboids from portable streams while Procedural Core owns native geometry and meshes.
 * MitzvahWorld retains only semantic size, placement, and remote-material identity; every cuboid remains hidden until
 * genuine remote imagery is hydrated, so no flat color or generated substitute can masquerade as the intended world surface.
 */

import {
	createNativeIndexedGeometry,
	createNativeMeshFromGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

const FACES = Object.freeze([
	face([0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]),
	face([0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]),
	face([1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]),
	face([-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]),
	face([0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]),
	face([0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]])
]);

/**
 * Creates one hidden UV cuboid whose semantic material can hydrate later.
 * @returns {object} Core-owned mesh with remote-only visibility evidence.
 */
export function createFallbackBoxMesh(name, size, position, color, semanticRole = null) {
	const geometry = boxGeometry(size);
	const material = createBootstrapImmediateMaterial(`${name}-material`, color, {
		mapRepeat: [3, 3],
		semanticRole
	});
	const mesh = createNativeMeshFromGeometry(geometry, material, {
		name,
		userData: {
			awtsmoosRemoteOnlyVisibility: {
				hiddenByCovenant: true,
				previousVisible: true
			},
			semanticMaterialRole: semanticRole
		}
	});
	mesh.position.set(position[0], position[1], position[2]);
	mesh.visible = false;
	mesh.setBaseTransform();
	return mesh;
}

/**
 * Produces one portable face-separated cuboid and asks Core to materialize it.
 * @param {number[]} size Full XYZ dimensions.
 * @returns {object} Core-owned indexed geometry with truthful normals and UVs.
 */
function boxGeometry(size) {
	const positions = [];
	const normals = [];
	const uvs = [];
	const indices = [];
	const half = size.map(value => value * 0.5);
	for (const [faceIndex, definition] of FACES.entries()) {
		const offset = faceIndex * 4;
		for (const corner of definition.corners) {
			positions.push(corner[0] * half[0], corner[1] * half[1], corner[2] * half[2]);
			normals.push(...definition.normal);
		}
		uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
		indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
	}
	return createNativeIndexedGeometry({
		indices,
		normals,
		positions,
		uvs
	});
}

/**
 * Freezes one reusable face recipe so geometry generation cannot mutate shared topology.
 * @returns {object} Immutable face normal and corner list.
 */
function face(normal, corners) {
	return Object.freeze({
		corners: Object.freeze(corners.map(corner => Object.freeze(corner))),
		normal: Object.freeze(normal)
	});
}
