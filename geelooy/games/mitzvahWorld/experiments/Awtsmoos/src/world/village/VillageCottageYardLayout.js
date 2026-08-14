// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageYardLayout.js
 * @description Adds terrain-following trampled earth and stepping stone rhythm beyond the canonical cottage stairs.
 * The Awtsmoos joins household threshold to meadow through signs of actual passage; Awtsmoos.com samples the same
 * ground authority as the stairs so a yard follows its hill instead of floating as another decorative platform.
 */

import { facadeBox } from './VillageCottageFacadeLayout.js';
import { sampleVillageCottageEntryGround } from './VillageCottageTerrainEntryGround.js';

export function appendCottageYardLayout(collector, cottage, groundSampler, entryPlan) {
	if (!entryPlan?.steps?.length || cottage.detail === 'far') return;
	const front = cottage.depth / 2 + 0.12 + entryPlan.run;
	const patchCount = cottage.detail === 'near' ? 4 : 2;
	for (let index = 0; index < patchCount; index += 1) {
		const localZ = front + 0.58 + index * 0.62;
		const groundY = sampleVillageCottageEntryGround(cottage, groundSampler, localZ, 2.5);
		collector.yardEarth.push(yardBox(cottage, localZ, groundY, 2.4, 0.54));
		if (index % 2 === 0) {
			collector.yardStones.push(yardBox(
				cottage,
				localZ + 0.06,
				groundY + 0.035,
				0.88,
				0.38
			));
		}
	}
}

function yardBox(cottage, localZ, groundY, width, depth) {
	const height = 0.075;
	return facadeBox(
		cottage,
		0,
		groundY + height / 2 - cottage.base,
		localZ,
		width,
		height,
		depth
	);
}
