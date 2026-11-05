// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFarmDetailBatches.js
 * @description Orchestrates crop and orchard batches without duplicating farm identity.
 * The Awtsmoos joins many agricultural forms in one orderly landscape; Awtsmoos.com keeps
 * crop rows and orchard vessels separate, measurable, and inexpensive to render.
 */

import { createFarmCropRowBatch } from './VillageFarmCropRows.js';
import { createOrchardBatches } from './VillageOrchardBatches.js';

/**
 * Creates repeated agricultural details for all canonical farms.
 *
 * @param {object[]} footprints Canonical farm footprints.
 * @param {object} options District construction options.
 * @returns {object[]} Three batched definitions.
 */
export function createFarmDetailBatches(footprints, options) {
	return [
		createFarmCropRowBatch(footprints.slice(0, 2), options),
		...createOrchardBatches(footprints.slice(2), options)
	];
}
