//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapFrustumGeometry.js
 * @description Owns one shared tapered frustum for first-play hills.
 * The bootstrap hills used to be literal boxes, so they read as flat green
 * walls; a frustum (wide base, inset crown) reads as a mound with the same
 * two-tier placement and the same shared-geometry cost as the cube.
 */

import {
	createNativeIndexedGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

// Top half-extent of the unit frustum: the crown is 55% as wide as the base.
const TOP_HALF = 0.275;
const FACE_UVS = [0, 0, 1, 0, 1, 1, 0, 1];

// Five faces in the cube's winding order: front, back, left, right, top.
// The bottom face is omitted; hills sit on the ground and it is never seen.
const FACES = [
	[[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [TOP_HALF, 0.5, TOP_HALF], [-TOP_HALF, 0.5, TOP_HALF]],
	[[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-TOP_HALF, 0.5, -TOP_HALF], [TOP_HALF, 0.5, -TOP_HALF]],
	[[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-TOP_HALF, 0.5, TOP_HALF], [-TOP_HALF, 0.5, -TOP_HALF]],
	[[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [TOP_HALF, 0.5, -TOP_HALF], [TOP_HALF, 0.5, TOP_HALF]],
	[[-TOP_HALF, 0.5, TOP_HALF], [TOP_HALF, 0.5, TOP_HALF], [TOP_HALF, 0.5, -TOP_HALF], [-TOP_HALF, 0.5, -TOP_HALF]]
];

let sharedGeometry = null;
/**
 * Returns the single shared face-aware bootstrap frustum.
 * @returns {object} Shared native geometry with positions, normals, UVs, and 30 indices.
 */
export function bootstrapFrustumGeometry() {
	sharedGeometry ||= createFrustumGeometry();
	return sharedGeometry;
}

/** Materializes the immutable portable frustum recipe exactly once through Core. */
function createFrustumGeometry() {
	const positions = [];
	const normals = [];
	const indices = [];
	const uvs = [];
	for (const [index, face] of FACES.entries()) {
		const normal = faceNormal(face);
		for (const vertex of face) {
			positions.push(...vertex);
			normals.push(...normal);
		}
		const base = index * 4;
		indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
		uvs.push(...FACE_UVS);
	}
	return createNativeIndexedGeometry({
		indices,
		normals,
		positions,
		uvs
	}, {
		geometryUserData: {
			bootstrapPrimitive: 'shared-frustum-face-aware'
		}
	});
}

/** Returns the unit outward normal of one wound quad. */
function faceNormal(face) {
	const [a, b, c] = face;
	const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
	const cross = [
		u[1] * v[2] - u[2] * v[1],
		u[2] * v[0] - u[0] * v[2],
		u[0] * v[1] - u[1] * v[0]
	];
	const length = Math.hypot(cross[0], cross[1], cross[2]) || 1;
	return [cross[0] / length, cross[1] / length, cross[2] / length];
}
