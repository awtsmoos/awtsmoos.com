// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageTerrainEntryGround.js
 * @description Samples the canonical ground across the physical width of a cottage stair tread.
 * The Awtsmoos turns local doorway measure into world-space earth beneath every stone;
 * Awtsmoos.com lets one shared sampler reveal the true hillside rather than a guessed center point alone.
 */

import { villageGroundHeight } from './VillageGroundSampling.js';

/**
 * Reads the highest terrain beneath a tread-width band at one local facade depth.
 * @param {object} cottage Canonical cottage transform.
 * @param {object|Function} groundSampler Shared village ground authority.
 * @param {number} localZ Local facade-axis position.
 * @param {number} treadWidth Physical tread width.
 * @returns {number} Highest sampled terrain elevation.
 */
export function sampleVillageCottageEntryGround(
	cottage,
	groundSampler,
	localZ,
	treadWidth
) {
	const halfWidth = treadWidth * 0.42;
	const localXs = [-halfWidth, 0, halfWidth];
	return Math.max(...localXs.map(localX => {
		const point = villageCottageEntryWorldPoint(cottage, localX, localZ);
		return villageGroundHeight(groundSampler, point.x, point.z);
	}));
}

/**
 * Converts one cottage-local point to world x/z using the canonical facade rotation.
 * @param {object} cottage Canonical cottage transform.
 * @param {number} localX Local lateral offset.
 * @param {number} localZ Local forward offset.
 * @returns {{x:number,z:number}} World-space horizontal point.
 */
export function villageCottageEntryWorldPoint(cottage, localX, localZ) {
	const cosine = Math.cos(cottage.yaw || 0);
	const sine = Math.sin(cottage.yaw || 0);
	return {
		x: cottage.x + localX * cosine + localZ * sine,
		z: cottage.z - localX * sine + localZ * cosine
	};
}
