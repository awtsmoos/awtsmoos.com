// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnatomyGeometry.js
 * @description Merges articulated hostile anatomy into one colored indexed GPU vessel.
 * The Awtsmoos joins many named limbs without division; Awtsmoos.com keeps one draw call,
 * exact flat normals, deterministic topology, and no hidden Three.js dependency.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { shadowDemonAnatomyParts } from './ShadowDemonAnatomyCatalog.js';

const FACES = Object.freeze([
	face([0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]),
	face([0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]),
	face([1, 0, 0], [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]]),
	face([-1, 0, 0], [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]]),
	face([0, 1, 0], [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]]),
	face([0, -1, 0], [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]])
]);

export function createShadowDemonAnatomyMesh(profile) {
	const parts = shadowDemonAnatomyParts(profile);
	const data = { colors: [], indices: [], normals: [], positions: [], uvs: [] };
	for (const part of parts) appendPart(data, part);
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(data.positions, 3));
	geometry.setAttribute('normal', attribute(data.normals, 3));
	geometry.setAttribute('color', attribute(data.colors, 4));
	geometry.setAttribute('uv', attribute(data.uvs, 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	geometry.userData.anatomyParts = parts.length;
	geometry.userData.rendererNeutral = true;
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		name: `${profile.id}-anatomy-material`
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = `${profile.id}-merged-anatomy`;
	mesh.userData.anatomyParts = parts.length;
	mesh.userData.family = 'procedural-shadow-demon-anatomy';
	return mesh;
}

function appendPart(data, part) {
	const half = part.size.map(value => value * 0.5);
	for (const definition of FACES) {
		const offset = data.positions.length / 3;
		const normal = rotate(definition.normal, part.rotation);
		for (const corner of definition.corners) {
			const point = rotate([
				corner[0] * half[0],
				corner[1] * half[1],
				corner[2] * half[2]
			], part.rotation);
			data.positions.push(
				point[0] + part.position[0],
				point[1] + part.position[1],
				point[2] + part.position[2]
			);
			data.normals.push(...normal);
			data.colors.push(...part.color);
		}
		data.uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
		data.indices.push(offset, offset + 1, offset + 2, offset, offset + 2, offset + 3);
	}
}

function rotate(vector, rotation) {
	let [x, y, z] = vector;
	const [rx, ry, rz] = rotation;
	const cx = Math.cos(rx); const sx = Math.sin(rx);
	const cy = Math.cos(ry); const sy = Math.sin(ry);
	const cz = Math.cos(rz); const sz = Math.sin(rz);
	[y, z] = [y * cx - z * sx, y * sx + z * cx];
	[x, z] = [x * cy - z * sy, x * sy + z * cy];
	[x, y] = [x * cz - y * sz, x * sz + y * cz];
	return [x, y, z];
}

function face(normal, corners) {
	return Object.freeze({ corners: Object.freeze(corners), normal: Object.freeze(normal) });
}

function attribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize);
}
