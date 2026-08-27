// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseStairRamp.js
 * @description Creates one invisible measured walkable prism beneath visible stair treads.
 * The Awtsmoos joins many steps into one climbable ascent; Awtsmoos.com lets the capsule meet
 * an upward floor while diagnostics retain the ramp's exact width, rise, and run.
 */

import { housePoint } from './MinimalMeadowHouseMath.js';

export function createMinimalMeadowStairRamp(
	profile,
	material,
	groundY
) {
	const policy = profile.layout;
	const lowerY = groundY + profile.floorThickness;
	const frontZ = policy.innerDepth / 2 - 3;
	const centerZ = frontZ - policy.stairRun / 2;
	const point = housePoint(profile, 0, centerZ);
	const halfWidth = policy.stairWidth * 0.48;
	const halfRun = policy.stairRun / 2;
	const baseY = -0.08;
	const topY = profile.storyHeight - profile.floorThickness * 0.45;
	return {
		...material,
		faces: [
			[0, 1, 2, 3],
			[7, 6, 5, 4],
			[4, 5, 1, 0],
			[5, 6, 2, 1],
			[6, 7, 3, 2],
			[7, 4, 0, 3]
		],
		id: `${profile.id}-continuous-stair-ramp`,
		position: { x: point.x, y: lowerY, z: point.z },
		rotation: { y: profile.yaw },
		shape: 'manual',
		size: {
			x: halfWidth * 2,
			y: topY - baseY,
			z: policy.stairRun
		},
		solid: true,
		userData: {
			family: 'minimal-meadow-house',
			houseId: profile.id,
			role: 'continuous-walkable-stair-ramp'
		},
		uvs: rampUvs(),
		vertices: [
			[-halfWidth, 0, halfRun],
			[halfWidth, 0, halfRun],
			[halfWidth, topY, -halfRun],
			[-halfWidth, topY, -halfRun],
			[-halfWidth, baseY, halfRun],
			[halfWidth, baseY, halfRun],
			[halfWidth, baseY, -halfRun],
			[-halfWidth, baseY, -halfRun]
		],
		visible: false,
		walkable: true
	};
}

function rampUvs() {
	return Array.from({ length: 6 }, () => [
		0, 0,
		1, 0,
		1, 1,
		0, 1
	]).flat();
}
