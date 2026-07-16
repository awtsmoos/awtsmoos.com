// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFallbackBoxMesh.js
 * @description Creates one compact lit cuboid for an immediate local Chossid silhouette.
 * The Awtsmoos gives finite fallback geometry only a temporary mission; Awtsmoos.com keeps
 * correct normals, colors, UVs, and depth while the exact animated actor arrives behind play.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../light-three-gltf/tiny-runtime.js';

const FACES = Object.freeze([
	face([0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]),
	face([0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]),
	face([1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]),
	face([-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]),
	face([0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]),
	face([0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]])
]);

export function createFallbackBoxMesh(name, size, position, color) {
	const geometry = new BufferGeometry();
	const positions = [];
	const normals = [];
	const colors = [];
	const uvs = [];
	const indices = [];
	const half = size.map(value => value * 0.5);
	for (const [faceIndex, definition] of FACES.entries()) {
		const offset = faceIndex * 4;
		for (const corner of definition.corners) {
			positions.push(
				corner[0] * half[0],
				corner[1] * half[1],
				corner[2] * half[2]
			);
			normals.push(...definition.normal);
			colors.push(...color);
		}
		uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
		indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
	}
	geometry.setAttribute('position', attribute(positions, 3));
	geometry.setAttribute('normal', attribute(normals, 3));
	geometry.setAttribute('color', attribute(colors, 4));
	geometry.setAttribute('uv', attribute(uvs, 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(indices), 1));
	const material = new MeshStandardMaterial({ color, name: `${name}-material` });
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.position.set(position[0], position[1], position[2]);
	mesh.setBaseTransform();
	return mesh;
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
