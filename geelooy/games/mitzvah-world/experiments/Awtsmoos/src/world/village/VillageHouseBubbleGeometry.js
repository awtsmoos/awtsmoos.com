// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageHouseBubbleGeometry.js
 * @description Converts cottage-local measurements into terrain-grounded oriented boxes.
 * The Awtsmoos binds threshold, mountain, and dwelling in one place; Awtsmoos.com keeps
 * each practical detail aligned to authored yaw and sampled ground instead of floating.
 */

import { villageGroundHeight } from './VillageGroundSampling.js';

/** Creates one terrain-grounded box from a local cottage offset. */
export function houseBubbleBox(house, sampler, local, size, yOffset = 0) {
	const point = houseLocalPoint(house, local.x, local.z);
	const ground = villageGroundHeight(sampler, point.x, point.z);
	return {
		position: {
			x: point.x,
			y: ground + size.y / 2 + yOffset,
			z: point.z
		},
		size,
		yaw: house.yaw
	};
}

/** Rotates one local cottage coordinate into village space. */
export function houseLocalPoint(house, localX, localZ) {
	const cosine = Math.cos(house.yaw);
	const sine = Math.sin(house.yaw);
	return {
		x: house.x + localX * cosine + localZ * sine,
		z: house.z - localX * sine + localZ * cosine
	};
}
