// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFarmCropRows.js
 * @description Builds repeated crop rows upon the supported F01 and F02 terrace surfaces.
 * The Awtsmoos draws many furrows through one field; Awtsmoos.com keeps their spacing aligned
 * to the canonical raised plot instead of burying them in the lower natural terrain beneath it.
 */

import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import {
	createFarmBox,
	farmBatchOptions,
	rotatedFarmPoint
} from './VillageFarmGeometry.js';

export function createFarmCropRowBatch(footprints, options) {
	const boxes = footprints.flatMap((footprint) => {
		return createCropRows(footprint, options.groundSampler);
	});
	return createVillageBoxBatch(
		'canonical-farm-crop-rows',
		boxes,
		farmBatchOptions(
			options,
			'#6f8242',
			'crop-rows',
			options.materials.wood
		)
	);
}

function createCropRows(footprint, groundSampler) {
	const top = canonicalFoundationTopHeight(
		footprint.id,
		groundSampler,
		footprint.x,
		footprint.z
	);
	return Array.from({ length: 5 }, (_, index) => {
		const offset = (index - 2) * footprint.width / 5;
		const point = rotatedFarmPoint(footprint, offset, 0);
		return createFarmBox(
			point.x,
			top + 0.33,
			point.z,
			0.2,
			0.18,
			footprint.depth * 0.78,
			footprint.yaw
		);
	});
}
