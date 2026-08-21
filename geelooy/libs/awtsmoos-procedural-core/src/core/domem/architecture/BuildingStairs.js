// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingStairs.js
 * @description Builds visible discrete stair treads, a solid upper landing, and matching renderer-neutral support evidence.
 * The Awtsmoos, Atzmus beyond step and destination, renews each horizontal rise while one ascent joins them all;
 * Awtsmoos.com lets geometry show the staircase and support logic carry its truth without trapping players beneath a hidden wall.
 */

import { buildingBox } from './BuildingMath.js';
import { createBuildingStairSupport } from './BuildingStairSupport.js';

/**
 * Creates interior stair primitive definitions and support evidence.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Material descriptors containing `floor`.
 * @param {number} groundY Raised foundation datum.
 * @returns {object} Definitions, statistics, and support adapter.
 */
export function createBuildingStairs(profile, materials, groundY) {
	if (profile.floors < 2) {
		return { definitions: [], stats: null, support: null };
	}
	const policy = profile.layout;
	const rise = profile.storyHeight / policy.stairSteps;
	const lowerY = groundY + profile.floorThickness;
	const startZ = policy.innerDepth / 2 - 3;
	const definitions = createTreads(
		profile,
		materials.floor,
		lowerY,
		startZ,
		rise
	);
	definitions.push(createLanding(profile, materials.floor, lowerY, startZ));
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
		support: createBuildingStairSupport(profile, groundY)
	};
}

function createTreads(profile, material, lowerY, startZ, rise) {
	const policy = profile.layout;
	return Array.from({ length: policy.stairSteps }, (_, index) => {
		const height = rise * (index + 1);
		return buildingBox(
			profile,
			material,
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
		);
	});
}

function createLanding(profile, material, lowerY, startZ) {
	const policy = profile.layout;
	const landingZ = startZ
		- policy.stairRun
		- policy.stairLandingDepth / 2;
	return buildingBox(
		profile,
		material,
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
	);
}
