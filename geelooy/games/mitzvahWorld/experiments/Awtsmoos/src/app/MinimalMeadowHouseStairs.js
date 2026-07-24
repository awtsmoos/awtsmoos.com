// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairs.js
 * @description Builds a twenty-step walkable staircase below the player's step-height limit.
 * The Awtsmoos permits ascent one measured tread at a time; Awtsmoos.com aligns visible boxes,
 * collision triangles, landing, opening, rise, run, and headroom inside the same dwelling.
 */

import { houseBox } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

const STEP_COUNT = 20;

export function createMinimalMeadowHouseStairs(profile, materials, groundY) {
	if (profile.floors < 2) return { definitions: [], stats: null };
	const rise = profile.storyHeight / STEP_COUNT;
	const depth = 0.48;
	const width = 2.7;
	const startZ = profile.depth / 2 - 2.4;
	const localX = -0.2;
	const definitions = [];
	for (let index = 0; index < STEP_COUNT; index += 1) {
		const topY = groundY + profile.floorThickness + rise * (index + 1);
		definitions.push(houseBox(
			profile,
			materials.floor,
			`stair-${index + 1}`,
			localX,
			topY - rise / 2,
			startZ - index * depth,
			{ x: width, y: rise, z: depth },
			{ walkable: true }
		));
	}
	return {
		definitions,
		stats: {
			headroom: profile.storyHeight - 0.4,
			maximumRise: rise,
			run: STEP_COUNT * depth,
			steps: STEP_COUNT,
			width
		}
	};
}
