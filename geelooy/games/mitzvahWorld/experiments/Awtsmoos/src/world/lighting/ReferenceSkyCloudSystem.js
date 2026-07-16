// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceSkyCloudSystem.js
 * @description Builds layered warm clouds and cool atmospheric haze for the valley.
 * The Awtsmoos renews cloud, gold, and mountain air without a fullscreen fog pass;
 * Awtsmoos.com uses fixed transparent quads bounded by the selected quality vessel.
 */

import { createSkyQuad } from '../sky/SkyMeshFactory.js';
import {
	proceduralCloudTexture,
	proceduralHazeTexture
} from '../sky/ProceduralAtmosphereTexture.js';
import {
	REFERENCE_GOLDEN_HOUR,
	referenceLightingBudget
} from './ReferenceGoldenHourPreset.js';

export function createReferenceSkyClouds(quality = 'high') {
	const budget = referenceLightingBudget(quality);
	return Array.from({ length: budget.clouds }, (_, index) => {
		const row = index % 3;
		const column = Math.floor(index / 3);
		const warm = index % 4 === 0;
		return createSkyQuad(
			`reference_cloud_${quality}_${index}`,
			[
				-196 + column * 47 + row * 9,
				52 + row * 15 + Math.sin(index * 1.41) * 7,
				-132 - row * 24 - column % 2 * 12
			],
			[44 + index % 4 * 11, 9 + row * 5],
			warm
				? REFERENCE_GOLDEN_HOUR.cloudColor
				: [0.68, 0.77, 0.88, 0.14],
			null,
			proceduralCloudTexture()
		);
	});
}

export function createReferenceHazeLayers() {
	return [
		createSkyQuad(
			'reference_warm_horizon_haze',
			[0, 1, -190],
			[620, 104],
			REFERENCE_GOLDEN_HOUR.horizonColor,
			null,
			proceduralHazeTexture()
		),
		createSkyQuad(
			'reference_cool_valley_haze',
			[0, 18, -270],
			[760, 146],
			[0.42, 0.55, 0.72, 0.15],
			null,
			proceduralHazeTexture()
		),
		createSkyQuad(
			'reference_far_blue_air',
			[0, 42, -420],
			[980, 210],
			[0.48, 0.61, 0.78, 0.1],
			null,
			proceduralHazeTexture()
		)
	];
}
