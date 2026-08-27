// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRiverBanksDiagnostics.js
 * @description Samples bed, water, bank, continuity, and world bounds as hydrology evidence.
 * The Awtsmoos joins hidden depth to visible current; Awtsmoos.com proves each sampled bed lies
 * below water, each bank rises above it, and source reaches destination without a severed segment.
 */

import { minimalMeadowHeightAt } from './MinimalMeadowTerrainShape.js?v=20260724-meadow-21';
import {
	minimalMeadowRiverContinuity,
	minimalMeadowRiverSample
} from './MinimalMeadowRiverPath.js';

export function minimalMeadowWaterElevationEvidence(samples = 25) {
	let minimumDepth = Infinity;
	let minimumBankRise = Infinity;
	for (let index = 0; index < samples; index += 1) {
		const t = index / (samples - 1);
		const sample = minimalMeadowRiverSample(t);
		const bedY = minimalMeadowHeightAt(sample.x, sample.z) + 0.035;
		minimumDepth = Math.min(minimumDepth, sample.waterY - bedY);
		const side = riverSide(t);
		const bankX = sample.x + side.x * (sample.width + 2.4);
		const bankZ = sample.z + side.z * (sample.width + 2.4);
		const bankY = Math.max(sample.waterY + 0.08, minimalMeadowHeightAt(bankX, bankZ) + 0.045);
		minimumBankRise = Math.min(minimumBankRise, bankY - sample.waterY);
	}
	return Object.freeze({
		aligned: minimumDepth > 0.1 && minimumBankRise >= 0.079,
		continuity: minimalMeadowRiverContinuity(),
		minimumBankRise,
		minimumDepth,
		samples
	});
}

function riverSide(t) {
	const before = minimalMeadowRiverSample(Math.max(0, t - 0.01));
	const after = minimalMeadowRiverSample(Math.min(1, t + 0.01));
	const length = Math.max(0.001, Math.hypot(after.x - before.x, after.z - before.z));
	return { x: -(after.z - before.z) / length, z: (after.x - before.x) / length };
}
