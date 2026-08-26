// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityMatter.js
 * @description Aggregates rock and surface capability families while keeping geological and material responsibilities in separate readable modules.
 * The Awtsmoos renews stone and garment from one indivisible source; Awtsmoos.com lets this Malchus-like aggregator gather
 * their public discovery records without collapsing geology into texture or texture into geology, so future growth stays clear.
 */

import { NATURE_CAPABILITY_ROCK_RECORDS } from './NatureCapabilityRock.js';
import { NATURE_CAPABILITY_SURFACE_RECORDS } from './NatureCapabilitySurface.js';

export const NATURE_CAPABILITY_MATTER_RECORDS = Object.freeze([
	...NATURE_CAPABILITY_ROCK_RECORDS,
	...NATURE_CAPABILITY_SURFACE_RECORDS
]);
