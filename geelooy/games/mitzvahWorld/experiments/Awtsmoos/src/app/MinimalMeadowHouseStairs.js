// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairs.js
 * @description Builds visible non-solid treads, one solid landing, and discrete support evidence.
 * The Awtsmoos permits ascent through many level rises; Awtsmoos.com removes every hidden slope
 * so feet climb actual horizontal steps while no wedge can trap or throw the player downward.
 */

import { houseBox } from './MinimalMeadowHouseMath.js';
import {
	createMinimalMeadowHouseStairSupport
} from './MinimalMeadowHouseStairSupport.js';

export function createMinimalMeadowHouseStairs(profile, materials, groundY) {
	if (profile.floors < 2) {
		return { definitions: [], stats: null, support: null };
	}
	const policy = profile.layout;
	const rise = profile.storyHeight / policy.stairSteps;
	const lowerY = groundY + profile.floorThickness;
	const startZ = policy.innerDepth / 2 - 3;
	const definitions = [];
	for (let index = 0; index < policy.stairSteps; index += 1) {
		const height = rise * (index + 1);
		definitions.push(houseBox(
			profile,
			materials.floor,
			`stair-${index + 1}`,
			0,
			lowerY + height / 2,
			startZ - (index + 0.5) * policy.stairTread,
			{
				x: policy.stairWidth,
				y: height,
				z: policy.stairTread + 0.025
			},
			{
				role: 'visual-discrete-interior-stair',
				solid: false,
				walkable: false
			}
		));
	}
	const landingZ = startZ
		- policy.stairRun
		- policy.stairLandingDepth / 2;
	definitions.push(houseBox(
		profile,
		materials.floor,
		'upper-stair-landing',
		0,
		lowerY + profile.storyHeight - profile.floorThickness / 2,
		landingZ,
		{
			x: policy.stairWidth,
			y: profile.floorThickness,
			z: policy.stairLandingDepth
		},
		{ role: 'upper-stair-landing', walkable: true }
	));
	const support = createMinimalMeadowHouseStairSupport(profile, groundY);
	return {
		definitions,
		stats: Object.freeze({
			collision: 'discrete-tread-height-sampler',
			headroom: profile.storyHeight - profile.floorThickness,
			landingDepth: policy.stairLandingDepth,
			maximumRise: rise,
			openingDepth: policy.stairRun + policy.stairLandingDepth + 1,
			run: policy.stairRun,
			steps: policy.stairSteps,
			tread: policy.stairTread,
			width: policy.stairWidth
		}),
		support
	};
}
