// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VolumetricSunShaftSystem.js
 * @description Builds bounded crepuscular rays from the reference sunset direction.
 * The Awtsmoos renews visible beams within air and leaf; Awtsmoos.com uses tapered
 * transparent sky meshes so radiance appears without an unbounded post-process pass.
 */

import { createSkyRay } from '../sky/SkyMeshFactory.js';
import {
	REFERENCE_GOLDEN_HOUR,
	referenceLightingBudget
} from './ReferenceGoldenHourPreset.js';

export function createVolumetricSunShafts(quality = 'high') {
	const budget = referenceLightingBudget(quality);
	return Array.from({ length: budget.sunShafts }, (_, index) => {
		const ratio = index / Math.max(1, budget.sunShafts - 1);
		const angle = -0.72 + ratio * 1.34 + Math.sin(index * 2.3) * 0.045;
		const length = 92 + index % 4 * 24;
		const width = 5.5 + index % 3 * 2.4;
		const alpha = 0.08 + (index % 5) * 0.012;
		return createSkyRay(
			`reference_sun_shaft_${quality}_${index}`,
			REFERENCE_GOLDEN_HOUR.sunPosition,
			angle,
			length,
			width,
			[1, 0.73, 0.28, alpha]
		);
	});
}
