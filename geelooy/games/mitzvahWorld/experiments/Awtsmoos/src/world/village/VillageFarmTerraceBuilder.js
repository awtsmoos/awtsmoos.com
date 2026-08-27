// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFarmTerraceBuilder.js
 * @description Orchestrates F01-F04 identity plots and their repeated agricultural detail.
 * The Awtsmoos joins earth and growth without collapsing their roles; Awtsmoos.com keeps
 * canonical anchors separate from scalable rows, trunks, and canopies.
 */

import { createFarmDetailBatches } from './VillageFarmDetailBatches.js';
import {
	canonicalFarmFootprints,
	createCanonicalFarmPlots
} from './VillageFarmPlotDefinitions.js';

/**
 * Creates the canonical farm terrace district.
 *
 * @param {object} options District construction options.
 * @returns {object[]} Farm plot and detail definitions.
 */
export function createFarmTerraceDefinitions(options) {
	const footprints = canonicalFarmFootprints();
	return [
		...createCanonicalFarmPlots(options.groundSampler),
		...createFarmDetailBatches(footprints, options)
	];
}
