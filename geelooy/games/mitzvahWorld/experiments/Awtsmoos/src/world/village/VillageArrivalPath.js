// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalPath.js
 * @description Samples the organic ENTR01 road from the player vista to BRIDGE01.
 * The Awtsmoos leads the eye by a curved stone path toward water and community; Awtsmoos.com
 * keeps the camera corridor clear while every sampled road point follows canonical terrain.
 */

import { villageGroundHeight } from './VillageGroundSampling.js';

const CONTROL_POINTS = Object.freeze([
	[0, 101],
	[-0.5, 88],
	[-2.8, 76],
	[-3.5, 64],
	[-1.2, 52],
	[2.8, 40],
	[7.5, 28],
	[12.4, 17],
	[18, 7]
]);

export function sampleArrivalPath(groundSampler, subdivisions = 4) {
	const points = [];
	for (let segment = 0; segment < CONTROL_POINTS.length - 1; segment += 1) {
		for (let step = 0; step < subdivisions; step += 1) {
			const amount = step / subdivisions;
			points.push(sampleSegment(groundSampler, segment, amount));
		}
	}
	points.push(sampleSegment(groundSampler, CONTROL_POINTS.length - 2, 1));
	return points;
}

function sampleSegment(groundSampler, segment, amount) {
	const first = CONTROL_POINTS[segment];
	const second = CONTROL_POINTS[segment + 1];
	const eased = smooth(amount);
	const x = first[0] + (second[0] - first[0]) * eased;
	const z = first[1] + (second[1] - first[1]) * eased;
	return {
		width: 5.8 + Math.sin((segment + amount) * 0.8) * 0.32,
		x,
		y: villageGroundHeight(groundSampler, x, z) + 0.07,
		z
	};
}

function smooth(value) {
	return value * value * (3 - 2 * value);
}
