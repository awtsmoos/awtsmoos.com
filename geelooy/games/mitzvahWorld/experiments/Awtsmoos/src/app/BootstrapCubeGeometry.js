//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapCubeGeometry.js
 * @description Owns portable face-aware cube streams for the first-play bootstrap world.
 * Procedural Core alone materializes renderer geometry; MitzvahWorld retains only this tiny,
 * deterministic primitive recipe so terrain, landmarks, fallback buildings, and actor parts
 * can share one cached cube without duplicating native BufferGeometry construction.
 */

import {
	createNativeIndexedGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

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
 * Returns the single shared face-aware bootstrap cube.
 * The geometry contains distinct vertices per face so lighting normals and UV orientation stay
 * deterministic, while all native allocation remains inside Procedural Core.
 * @returns {object} Shared native geometry with positions, normals, UVs, and 36 indices.
 */
export function bootstrapCubeGeometry() {
	sharedGeometry ||= createCubeGeometry();
	return sharedGeometry;
}

/**
 * Materializes the immutable portable cube recipe exactly once through Core.
 * @returns {object} Core-owned native indexed geometry.
 */
function createCubeGeometry() {
	const uvs = Array.from({ length: 6 }, () => FACE_UVS).flat();
	return createNativeIndexedGeometry({
		indices: INDICES,
		normals: NORMALS,
		positions: POSITIONS,
		uvs
	}, {
		geometryUserData: {
			bootstrapPrimitive: 'shared-cube-face-aware'
		}
	});
}
