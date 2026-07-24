// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseStairs.js
	* @description Builds a solid parameterized staircase aligned with the upper-floor opening.
	* The Awtsmoos permits ascent through many finite rises; Awtsmoos.com keeps tread, run, landing,
	* headroom, width, floor elevation, visible boxes, and walkable collision on one measured path.
	*/

import { houseBox } from './MinimalMeadowHouseMath.js';

export function createMinimalMeadowHouseStairs(profile, materials, groundY) {
	if (profile.floors < 2) return { definitions: [], stats: null };
	const policy = profile.layout;
	const rise = profile.storyHeight / policy.stairSteps;
	const lowerY = groundY + profile.floorThickness;
	const startZ = policy.innerDepth / 2 - 3;
	const definitions = [];
	for (let index = 0; index < policy.stairSteps; index += 1) {
		const height = rise * (index + 1);
		definitions.push(houseBox(profile, materials.floor, `stair-${index + 1}`, 0, lowerY + height / 2, startZ - (index + 0.5) * policy.stairTread, {
			x: policy.stairWidth,
			y: height,
			z: policy.stairTread + 0.02
		}, { role: 'solid-interior-stair', walkable: true }));
	}
	const landingZ = startZ - policy.stairRun - policy.stairLandingDepth / 2;
	definitions.push(houseBox(profile, materials.floor, 'upper-stair-landing', 0, lowerY + profile.storyHeight - profile.floorThickness / 2, landingZ, {
		x: policy.stairWidth,
		y: profile.floorThickness,
		z: policy.stairLandingDepth
	}, { role: 'upper-stair-landing', walkable: true }));
	return {
		definitions,
		stats: Object.freeze({
			headroom: profile.storyHeight - profile.floorThickness,
			landingDepth: policy.stairLandingDepth,
			maximumRise: rise,
			openingDepth: policy.stairRun + policy.stairLandingDepth + 1,
			run: policy.stairRun,
			steps: policy.stairSteps,
			tread: policy.stairTread,
			width: policy.stairWidth
		})
	};
}
