// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageTerrainEntry.js
 * @description Manifests terrain-fitted cottage treads into the shared stone entry batch.
 * The Awtsmoos turns measured ascent into stone without spawning a private house system;
 * Awtsmoos.com keeps every tread inside the canonical district batch, one visible and walkable rhythm.
 */

import { facadeBox } from './VillageCottageFacadeLayout.js';
import { planVillageCottageTerrainEntry } from './VillageCottageTerrainEntryPlan.js';

/**
 * Appends real terrain-fitted stair boxes to the canonical entry collector.
 * @param {Array<object>} output Shared cottage entry-box collector.
 * @param {object} cottage Canonical cottage facade options.
 * @param {object|Function} groundSampler Shared village ground authority.
 * @returns {Readonly<object>} Stair-plan evidence for tests and diagnostics.
 */
export function appendCottageTerrainEntry(output, cottage, groundSampler) {
	const plan = planVillageCottageTerrainEntry(cottage, groundSampler);
	for (const tread of plan.steps) {
		const height = tread.top - tread.bottom;
		const centerY = tread.bottom + height / 2;
		output.push(facadeBox(
			cottage,
			0,
			centerY - cottage.base,
			tread.localZ,
			plan.treadWidth,
			height,
			plan.treadDepth + 0.03
		));
	}
	return plan;
}
