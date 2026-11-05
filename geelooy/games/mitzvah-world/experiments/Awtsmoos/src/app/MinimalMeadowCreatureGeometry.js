//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowCreatureGeometry.js
 * @description Caches reusable creature geometry while delegating native materialization to Procedural Core.
 * Portable sphere and tapered-limb topology lives in a dedicated stream module; this public doorway owns
 * only cache identity and Core conversion, keeping product rendering authority narrow and worker-friendly.
 */

import {
	createNativeIndexedGeometry
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import {
	createCreatureLimbStreams,
	createCreatureSphereStreams
} from './creatureGeometry/CreatureGeometryStreams.js';

const sphereCache = new Map();
const limbCache = new Map();

/**
 * Returns one cached smooth unit sphere with deterministic UVs and normals.
 * @param {number} segments Longitudinal subdivision count.
 * @param {number} rings Latitudinal subdivision count.
 * @returns {object} Core-owned native indexed geometry.
 */
export function creatureSphereGeometry(segments = 14, rings = 10) {
	const key = `${segments}:${rings}`;
	if (!sphereCache.has(key)) {
		sphereCache.set(
			key,
			createNativeIndexedGeometry(createCreatureSphereStreams(segments, rings))
		);
	}
	return sphereCache.get(key);
}

/**
 * Returns one cached tapered unit limb with closed caps and deterministic UVs.
 * @param {number} segments Circumferential subdivision count.
 * @param {number} topRadius Radius ratio at the upper end.
 * @returns {object} Core-owned native indexed geometry.
 */
export function creatureLimbGeometry(segments = 10, topRadius = 0.72) {
	const key = `${segments}:${topRadius}`;
	if (!limbCache.has(key)) {
		limbCache.set(
			key,
			createNativeIndexedGeometry(createCreatureLimbStreams(segments, topRadius))
		);
	}
	return limbCache.get(key);
}
