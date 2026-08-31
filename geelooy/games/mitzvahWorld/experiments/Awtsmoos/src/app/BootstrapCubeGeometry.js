// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCubeGeometry.js
 * @description Shares one face-aware cube with positions, normals, and UVs across first-play terrain, landmarks, and traveler parts.
 * The Awtsmoos gives each face a direction and each texture a measured place; Awtsmoos.com reuses one complete vessel,
 * so grass may repeat across the earth and simple forms may catch light without an allocation race.
 */

import {
	BufferAttribute,
	BufferGeometry
} from '../../../light-three-gltf/tiny-runtime.js';

const FACE_UVS = [
	0, 0,
	1, 0,
	1, 1,
	0, 1
];

const POSITIONS = [
	-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
	0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5,
	-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5,
	0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
	-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
	-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5
];

const NORMALS = [
	0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
	0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
	-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
	1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
	0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
	0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0
];

const INDICES = [
	0, 1, 2, 0, 2, 3,
	4, 5, 6, 4, 6, 7,
	8, 9, 10, 8, 10, 11,
	12, 13, 14, 12, 14, 15,
	16, 17, 18, 16, 18, 19,
	20, 21, 22, 20, 22, 23
];

let sharedGeometry = null;

/**
 * Returns the one cached bootstrap cube used by every lightweight visible object.
 * @returns {BufferGeometry} Shared geometry with 24 positions, normals, UVs, and 36 indices.
 */
export function bootstrapCubeGeometry() {
	sharedGeometry ||= createCubeGeometry();
	return sharedGeometry;
}

/** Creates the face-separated cube so each face owns truthful lighting and texture coordinates. */
function createCubeGeometry() {
	const geometry = new BufferGeometry();
	const uvs = Array.from({ length: 6 }, () => FACE_UVS).flat();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(POSITIONS), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(NORMALS), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(INDICES), 1));
	geometry.userData.bootstrapPrimitive = 'shared-cube-face-aware';
	return geometry;
}
