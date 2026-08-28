//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFallbackBoxMesh.js
 * @description Creates one UV-ready fallback cuboid that remains hidden until a genuine remote image is resident.
 * The Awtsmoos gives geometry without demanding a painted lie; Awtsmoos.com keeps every cuboid concealed
 * until a real remote garment reaches its material, so no vertex color or flat pigment becomes the world revealed.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import { createBootstrapImmediateMaterial } from './BootstrapImmediateMaterial.js';

const FACES = Object.freeze([
	face([0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]),
	face([0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]),
	face([1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]),
	face([-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]),
	face([0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]),
	face([0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]])
]);

/** Creates one hidden UV cuboid whose optional semantic role may hydrate later. */
export function createFallbackBoxMesh(name, size, position, color, semanticRole = null) {
	const geometry = boxGeometry(size);
	const material = createBootstrapImmediateMaterial(`${name}-material`, color, {
		mapRepeat: [3, 3],
		semanticRole
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.position.set(position[0], position[1], position[2]);
	mesh.visible = false;
	mesh.userData.semanticMaterialRole = semanticRole;
	mesh.userData.awtsmoosRemoteOnlyVisibility = {
		hiddenByCovenant: true,
		previousVisible: true
	};
	mesh.setBaseTransform();
	return mesh;
}

function boxGeometry(size) {
	const geometry = new BufferGeometry();
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
	geometry.setAttribute('position', attribute(positions, 3));
	geometry.setAttribute('normal', attribute(normals, 3));
	geometry.setAttribute('uv', attribute(uvs, 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
	return geometry;
}

function face(normal, corners) {
	return Object.freeze({
		corners: Object.freeze(corners.map(corner => Object.freeze(corner))),
		normal: Object.freeze(normal)
	});
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}
