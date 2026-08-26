// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityWater.js
 * @description Aggregates water-flow, dynamic-solver, ocean, shallow-water, and semantic-body discovery without merging their physical authorities.
 * The Awtsmoos renews river, basin, flood, droplet, and sea as one created reality while every finite law keeps its proper keli;
 * Awtsmoos.com lets this small Mayim aggregator gather discovery order without building another solver or stealing one conserved body.
 */

import { NATURE_CAPABILITY_WATER_BODY_RECORDS } from './NatureCapabilityWaterBodies.js';
import { NATURE_CAPABILITY_WATER_DYNAMICS_RECORDS } from './NatureCapabilityWaterDynamics.js';
import { NATURE_CAPABILITY_WATER_FLOW_RECORDS } from './NatureCapabilityWaterFlow.js';

export const NATURE_CAPABILITY_WATER_RECORDS = Object.freeze([
	...NATURE_CAPABILITY_WATER_FLOW_RECORDS,
	...NATURE_CAPABILITY_WATER_DYNAMICS_RECORDS,
	...NATURE_CAPABILITY_WATER_BODY_RECORDS
]);
